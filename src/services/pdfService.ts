import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface GeneratePdfOptions {
  elements: HTMLElement[];
  filename: string;
  paperSize?: 'F4' | 'A4';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  onProgress?: (current: number, total: number, studentName?: string) => void;
  shouldCancel?: () => boolean;
}

/**
 * Service to generate multi-page or single-page PDF directly saved to the user's device storage.
 * Optimized specifically for Indonesian school standard F4 (Folio 210 x 330 mm) and A4 formats.
 */
export const PdfService = {
  /**
   * Generates a PDF from an array of HTML elements (each representing one page),
   * and directly triggers the download to the device's storage.
   */
  async generateAndDownloadPdf({
    elements,
    filename,
    paperSize = 'A4',
    orientation = 'portrait',
    margins = { top: 15, bottom: 15, left: 20, right: 20 }, // Margin resmi: Atas 1.5 cm (15 mm), Bawah 1.5 cm (15 mm), Kiri 2 cm (20 mm), Kanan 2 cm (20 mm)
    onProgress,
    shouldCancel,
  }: GeneratePdfOptions): Promise<void> {
    if (!elements || elements.length === 0) {
      throw new Error('Tidak ada halaman dokumen yang dapat diunduh.');
    }

    // A4 size in mm: 210 x 297 mm (21 x 29.7 cm)
    // F4 size in mm: 210 x 330 mm (Folio/HVS Panjang)
    const pageWidth = orientation === 'portrait' ? 210 : (paperSize === 'F4' ? 330 : 297);
    const pageHeight = orientation === 'portrait' ? (paperSize === 'F4' ? 330 : 297) : 210;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: [pageWidth, pageHeight],
      compress: true,
    });

    const total = elements.length;

    // Margin setup: Atas 1.5 cm (15 mm), Bawah 1.5 cm (15 mm), Kiri 2 cm (20 mm), Kanan 2 cm (20 mm)
    const marginTop = margins.top;
    const marginBottom = margins.bottom;
    const marginLeft = margins.left;
    const marginRight = margins.right;

    const printableWidth = pageWidth - marginLeft - marginRight;
    const footerSpace = 10; // mm reserved for bottom footer
    const maxContentHeight = pageHeight - marginTop - marginBottom - footerSpace;

    for (let i = 0; i < total; i++) {
      if (shouldCancel && shouldCancel()) {
        throw new Error('Proses unduh PDF dibatalkan oleh pengguna.');
      }

      const el = elements[i];
      const studentName = (el.getAttribute('data-student-name') || '').trim();
      const studentNisn = (el.getAttribute('data-student-nisn') || '').trim();

      if (onProgress) {
        onProgress(i + 1, total, studentName || undefined);
      }

      // Hide temporary no-print elements during canvas capture
      const noPrintEls = el.querySelectorAll('.no-print');
      noPrintEls.forEach((node) => {
        (node as HTMLElement).style.visibility = 'hidden';
      });

      try {
        // High quality rasterization via html2canvas-pro
        const canvas = await html2canvas(el, {
          scale: 2, // 2x scale for crisp print resolution (approx 192 DPI)
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: orientation === 'landscape' ? 1400 : 800, // appropriate width for landscape vs portrait
          onclone: (clonedDoc: Document) => {
            if (orientation === 'landscape') {
              // Reveal print-only elements like Kop Sekolah and official signatures
              const printFlex = clonedDoc.querySelectorAll<HTMLElement>('.print\\:flex');
              printFlex.forEach((e) => {
                e.classList.remove('hidden');
                e.style.display = 'flex';
              });
              const printGrid = clonedDoc.querySelectorAll<HTMLElement>('.print\\:grid');
              printGrid.forEach((e) => {
                e.classList.remove('hidden');
                e.style.display = 'grid';
              });
              const printBlock = clonedDoc.querySelectorAll<HTMLElement>('.print\\:block');
              printBlock.forEach((e) => {
                e.classList.remove('hidden');
                e.style.display = 'block';
              });

              // Hide screen-only elements
              const noPrint = clonedDoc.querySelectorAll<HTMLElement>('.no-print');
              noPrint.forEach((e) => {
                e.style.display = 'none';
              });

              // Full width for landscape table cards without compressing
              const cards = clonedDoc.querySelectorAll<HTMLElement>('#rekap-ijazah-container, .printable-card');
              cards.forEach((card) => {
                card.style.fontFamily = 'Arial, Helvetica, sans-serif';
                card.style.border = 'none';
                card.style.boxShadow = 'none';
                card.style.borderRadius = '0px';
                card.style.backgroundColor = '#ffffff';
                card.style.margin = '0';
                card.style.padding = '10px';
                card.style.width = '100%';
                card.style.maxWidth = 'none';
                card.style.boxSizing = 'border-box';
              });

              // Ensure overflow containers expand fully
              const overflows = clonedDoc.querySelectorAll<HTMLElement>('.overflow-x-auto');
              overflows.forEach((o) => {
                o.style.overflow = 'visible';
              });
            } else {
              // Ensure all SKL page containers have exact natural A4 width (680px), borderless, plain white
              const pageCards = clonedDoc.querySelectorAll<HTMLElement>('.skl-page, .skl-batch-page, .skl-single-page');
              pageCards.forEach((card) => {
                card.style.fontFamily = 'Arial, Helvetica, sans-serif';
                card.style.border = 'none';
                card.style.boxShadow = 'none';
                card.style.borderRadius = '0px';
                card.style.backgroundColor = '#ffffff';
                card.style.margin = '0 auto';
                card.style.padding = '0px';
                card.style.width = '680px';
                card.style.maxWidth = '680px';
                card.style.minWidth = '680px';
                card.style.boxSizing = 'border-box';
              });

              // Hide HTML footer in clone so jsPDF draws crisp vector footer at exact physical page bottom
              const docFooters = clonedDoc.querySelectorAll<HTMLElement>('.skl-doc-footer');
              docFooters.forEach((footerEl) => {
                footerEl.style.display = 'none';
              });
            }

            // Ensure Kop and logos retain natural aspect ratio without distortion
            const imgs = clonedDoc.querySelectorAll<HTMLImageElement>('img');
            imgs.forEach((img) => {
              img.style.objectFit = 'contain';
            });
          },
        });

        // Fit content proportionally within the margin boundaries (Kiri: 2cm, Kanan: 2cm, Atas: 1.5cm)
        const imgWidth = printableWidth;
        let imgHeight = (canvas.height * imgWidth) / canvas.width;
        let xPos = marginLeft; // Exactly 2 cm from left
        const yPos = marginTop;  // Exactly 1.5 cm from top (Kop is positioned at the top!)

        // If content height exceeds available printable area, scale down proportionally
        let finalWidth = imgWidth;
        let finalHeight = imgHeight;
        if (imgHeight > maxContentHeight) {
          const scaleFactor = maxContentHeight / imgHeight;
          finalHeight = maxContentHeight;
          finalWidth = imgWidth * scaleFactor;
          xPos = marginLeft + (printableWidth - finalWidth) / 2;
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.92);

        if (i > 0) {
          pdf.addPage([pageWidth, pageHeight], orientation);
        }

        // 1. Draw SKL Document Content (Kop starts right at marginTop = 15mm)
        pdf.addImage(imgData, 'JPEG', xPos, yPos, finalWidth, finalHeight, undefined, 'FAST');

        // 2. Draw Bottom Footer
        const isSkl = Boolean(studentNisn || studentName);
        const footerText = isSkl
          ? (studentNisn && studentName ? `${studentNisn}_${studentName}` : (studentName || studentNisn || 'nisn_nama siswa'))
          : (orientation === 'landscape' ? 'Daftar Rekapitulasi Nilai Ijazah Kelas 6 - SDN Babelan Kota 01' : 'Dokumen Resmi Sekolah');

        const footerRightText = orientation === 'landscape' && paperSize === 'F4'
          ? 'Standar Kertas Cetak: F4 Landscape (330 × 210 mm)'
          : 'Dokumen Resmi Kelulusan';

        const footerLineY = pageHeight - marginBottom + 2; // e.g. 330 - 15 + 2 = 317 mm or 210 - 12 + 2
        const footerTextY = pageHeight - marginBottom + 6;

        // Thin separator line above footer
        pdf.setDrawColor(203, 213, 225); // slate-300
        pdf.setLineWidth(0.2);
        pdf.line(marginLeft, footerLineY, pageWidth - marginRight, footerLineY);

        // Footer text on the bottom-left
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(71, 85, 105); // slate-600
        pdf.text(footerText, marginLeft, footerTextY);

        // Right side info
        pdf.setFontSize(7.5);
        pdf.setTextColor(148, 163, 184); // slate-400
        pdf.text(footerRightText, pageWidth - marginRight, footerTextY, { align: 'right' });
      } finally {
        // Restore visibility of no-print elements
        noPrintEls.forEach((node) => {
          (node as HTMLElement).style.visibility = '';
        });
      }

      // Allow event loop to process so UI stays responsive and progress updates render
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    // Direct download into device storage
    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
  },
};
