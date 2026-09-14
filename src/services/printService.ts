/**
 * Service for managing print layout and PDF export triggers across the application.
 * Ensures proper F4 (Folio 330x210mm) or A4 Landscape/Portrait page setup, margins, and browser print-to-PDF compatibility.
 */

export type PaperSize = 'F4' | 'A4';

export interface PrintOptions {
  orientation?: 'landscape' | 'portrait';
  paperSize?: PaperSize;
  title?: string;
}

export const PrintService = {
  /**
   * Injects or updates dynamic @page rule for exact paper size (F4 330x210mm or A4) and orientation.
   */
  setPageOrientation(
    orientation: 'landscape' | 'portrait' = 'landscape',
    paperSize: PaperSize = 'F4'
  ) {
    let styleEl = document.getElementById('app-print-page-style') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'app-print-page-style';
      document.head.appendChild(styleEl);
    }

    let sizeDeclaration = '';
    let margin = '6mm 8mm';

    if (paperSize === 'F4') {
      // Standard Folio / F4 in Indonesia: 330mm x 210mm
      if (orientation === 'landscape') {
        sizeDeclaration = '330mm 210mm';
        margin = '5mm 7mm';
      } else {
        sizeDeclaration = '210mm 330mm';
        margin = '8mm 10mm';
      }
    } else {
      // Standard A4: 297mm x 210mm
      sizeDeclaration = `A4 ${orientation}`;
      margin = orientation === 'landscape' ? '8mm 10mm' : '10mm 12mm';
    }

    styleEl.innerHTML = `
      @media print {
        @page {
          size: ${sizeDeclaration} !important;
          margin: ${margin} !important;
        }
      }
    `;
  },

  /**
   * Triggers printing with specified orientation, paper size (F4 or A4), and document title.
   * Sets document.title so modern browsers use it as the default filename when "Save as PDF" is chosen.
   */
  triggerPrint(options: PrintOptions = {}) {
    const { orientation = 'landscape', paperSize = 'F4', title } = options;

    // Apply paper size & orientation
    this.setPageOrientation(orientation, paperSize);

    const originalTitle = document.title;
    if (title) {
      document.title = title.replace(/[^a-zA-Z0-9_\- ]/g, '_');
    }

    // Add orientation and paper classes to body
    document.body.classList.remove(
      'print-orientation-portrait',
      'print-orientation-landscape',
      'print-paper-f4',
      'print-paper-a4'
    );
    document.body.classList.add(`print-orientation-${orientation}`);
    document.body.classList.add(`print-paper-${paperSize.toLowerCase()}`);

    // Small timeout to allow DOM/styles to settle before triggering print
    setTimeout(() => {
      try {
        window.focus();
        window.print();
      } catch (err) {
        console.error('Error invoking window.print():', err);
      } finally {
        // Reset after printing dialog closes
        const cleanup = () => {
          if (title) {
            document.title = originalTitle;
          }
          document.body.classList.remove(
            'print-orientation-portrait',
            'print-orientation-landscape',
            'print-paper-f4',
            'print-paper-a4'
          );
          window.removeEventListener('afterprint', cleanup);
        };

        window.addEventListener('afterprint', cleanup);
        // Fallback cleanup in case afterprint doesn't fire
        setTimeout(cleanup, 2000);
      }
    }, 150);
  },
};
