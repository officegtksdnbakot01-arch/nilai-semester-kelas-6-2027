import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SemesterCode, Student } from '../types';
import { PrintService, PaperSize } from '../services/printService';
import { PdfService } from '../services/pdfService';
import { ExcelService } from '../services/excel';
import {
  Printer,
  FileText,
  Calendar,
  School,
  CheckCircle2,
  ChevronDown,
  Award,
  GraduationCap,
  Download,
  Sliders,
  Users,
  Settings2,
  FileCheck,
  Check,
  BadgeCheck,
  Loader2,
} from 'lucide-react';

type DashboardTab = 'rekap_ijazah' | 'surat_kelulusan' | 'leger_semester' | 'rapor_siswa';

// Helper formatter: Bilangan bulat tanpa koma, dibulatkan ke satuan terdekat (contoh: 88)
export const formatBulat = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return '-';
  return Math.round(val).toString();
};

// Helper formatter: Dua angka di belakang koma dengan pemisah koma Indonesia (contoh: 80,00)
export const formatDuaDesimal = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return '-';
  return Number(val).toFixed(2).replace('.', ',');
};

export const CetakLaporanView: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { students, subjects, grades, schoolExams, settings, updateSettings, rombels, addToast } = useApp();

  // Active Dashboard Tab
  const [activeTab, setActiveTab] = useState<DashboardTab>('rekap_ijazah');

  // Paper & Print Setup
  const [paperSize, setPaperSize] = useState<PaperSize>('F4');
  const [paperOrientation, setPaperOrientation] = useState<'landscape' | 'portrait'>('landscape');

  // Filters & State
  const defaultRombel = !isAdmin && currentUser?.rombel ? currentUser.rombel : '6A';
  const [selectedRombel, setSelectedRombel] = useState<string>(defaultRombel);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<SemesterCode>(settings.semester_aktif);

  // Bobot Nilai Ijazah: Rapor (30/40%) vs Ujian Sekolah (60/70%)
  const [bobotRapor, setBobotRapor] = useState<number>(40); // 40 or 30 or 50
  const bobotUS = 100 - bobotRapor; // 60 or 70 or 50

  // Table Display Mode for Rekap Ijazah:
  // 'standar': Rapor, US Akhir, Nilai Ijazah
  // 'detail': Rapor, US Tulis, US Praktek, US Akhir, Nilai Ijazah
  // 'ringkas': Nilai Ijazah saja
  const [ijazahViewMode, setIjazahViewMode] = useState<'standar' | 'detail' | 'ringkas'>('standar');

  // SKL (Surat Keterangan Lulus) Settings
  const [sklNomorSurat, setSklNomorSurat] = useState<string>('421.2 / 089 / SD-BKT.01 / 2027');
  const [sklTanggalLulus, setSklTanggalLulus] = useState<string>('10 Juni 2027');
  const [sklTanggalRapat, setSklTanggalRapat] = useState<string>('09 Juni 2027');
  const [sklKota, setSklKota] = useState<string>('Babelan');
  const [sklPrintMode, setSklPrintMode] = useState<'single' | 'batch'>('single');

  // PDF Direct Download to Storage State
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    current: number;
    total: number;
    studentName?: string;
  }>({
    current: 0,
    total: 0,
    studentName: '',
  });
  const cancelPdfRef = useRef<boolean>(false);

  // Action Handler: Unduh PDF Masal langsung menuju penyimpanan di perangkat (F4 Portrait 210 x 330 mm)
  const handleUnduhPdfMasal = async () => {
    if (rombelStudents.length === 0) {
      addToast('error', 'Tidak ada siswa pada rombel ini untuk diunduh.');
      return;
    }

    cancelPdfRef.current = false;
    setIsDownloadingPdf(true);
    setDownloadProgress({
      current: 0,
      total: rombelStudents.length,
      studentName: 'Menyiapkan dokumen SKL...',
    });

    // Ensure paper size and batch print mode are active
    setPaperSize('A4');
    setPaperOrientation('portrait');
    setSklPrintMode('batch');
    PrintService.setPageOrientation('portrait', 'A4');

    // Give React time to mount and render all batch cards
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      const cardElements = Array.from(
        document.querySelectorAll<HTMLElement>('.skl-batch-page')
      );

      if (cardElements.length === 0) {
        throw new Error('Elemen dokumen SKL tidak ditemukan pada layar.');
      }

      const filename = `SKL_Masal_Kelas6_${selectedRombel}_A4_Portrait.pdf`;

      await PdfService.generateAndDownloadPdf({
        elements: cardElements,
        filename,
        paperSize: 'A4',
        orientation: 'portrait',
        shouldCancel: () => cancelPdfRef.current,
        onProgress: (current, total, studentName) => {
          setDownloadProgress({ current, total, studentName });
        },
      });

      addToast(
        'success',
        `File PDF Masal (${rombelStudents.length} Siswa) berhasil disimpan langsung ke folder Download / Penyimpanan perangkat Anda!`
      );
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message?.includes('dibatalkan')) {
        addToast('info', 'Unduhan PDF masal telah dibatalkan.');
      } else {
        console.error('PDF Generation error:', err);
        addToast('error', `Gagal mengunduh PDF masal: ${error.message || 'Terjadi kesalahan sistem.'}`);
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Action Handler: Unduh PDF 1 Siswa langsung menuju penyimpanan perangkat (F4 Portrait)
  const handleUnduhPdfSingle = async () => {
    if (!currentStudent) {
      addToast('error', 'Pilih siswa terlebih dahulu.');
      return;
    }

    cancelPdfRef.current = false;
    setIsDownloadingPdf(true);
    setDownloadProgress({
      current: 0,
      total: 1,
      studentName: currentStudent.nama,
    });

    setPaperSize('A4');
    setPaperOrientation('portrait');
    PrintService.setPageOrientation('portrait', 'A4');

    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const singleEl = document.querySelector<HTMLElement>('#skl-single-card');
      if (!singleEl) {
        throw new Error('Dokumen SKL siswa tidak ditemukan.');
      }

      const filename = `SKL_${currentStudent.nama.replace(/[^a-zA-Z0-9]/g, '_')}_${currentStudent.nisn}_A4_Portrait.pdf`;

      await PdfService.generateAndDownloadPdf({
        elements: [singleEl],
        filename,
        paperSize: 'A4',
        orientation: 'portrait',
        shouldCancel: () => cancelPdfRef.current,
        onProgress: (current, total, studentName) => {
          setDownloadProgress({ current, total, studentName: currentStudent.nama });
        },
      });

      addToast(
        'success',
        `File PDF ${filename} berhasil disimpan langsung ke folder Download / Penyimpanan perangkat Anda!`
      );
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message?.includes('dibatalkan')) {
        addToast('info', 'Unduhan PDF dibatalkan.');
      } else {
        console.error('PDF Generation error:', err);
        addToast('error', `Gagal mengunduh PDF: ${error.message || 'Terjadi kesalahan sistem.'}`);
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // General tanggal cetak
  const [tanggalCetak, setTanggalCetak] = useState<string>(
    new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  );

  // Active subjects
  const activeSubjects = useMemo(() => subjects.filter((s) => s.aktif), [subjects]);

  // Semesters for Rapor (Kelas 4 s.d. 6)
  const raporSemesters: SemesterCode[] = useMemo(
    () => ['Smt1_Kls4', 'Smt2_Kls4', 'Smt1_Kls5', 'Smt2_Kls5', 'Smt1_Kls6', 'Smt2_Kls6'],
    []
  );

  // Target students for rombel
  const rombelStudents = useMemo(() => {
    if (selectedRombel === 'ALL') {
      return students.filter((s) => s.kelas === '6');
    }
    return students.filter((s) => s.rombel === selectedRombel);
  }, [students, selectedRombel]);

  // Ensure selected student matches current rombel
  React.useEffect(() => {
    if (rombelStudents.length > 0) {
      if (!selectedStudentId || !rombelStudents.some((s) => s.id === selectedStudentId)) {
        setSelectedStudentId(rombelStudents[0].id);
      }
    }
  }, [rombelStudents, selectedStudentId]);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || rombelStudents[0];
  const currentRombelInfo = rombels.find((r) => r.nama === selectedRombel);

  // Switch Tab with automated recommended paper settings
  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    if (tab === 'rekap_ijazah') {
      setPaperSize('F4');
      setPaperOrientation('landscape');
    } else if (tab === 'surat_kelulusan') {
      setPaperSize('A4');
      setPaperOrientation('portrait');
    } else if (tab === 'leger_semester') {
      setPaperSize('A4');
      setPaperOrientation('landscape');
    } else if (tab === 'rapor_siswa') {
      setPaperSize('A4');
      setPaperOrientation('portrait');
    }
  };

  // =========================================================================
  // REKAPITULASI NILAI IJAZAH CALCULATION ENGINE
  // Formula: Nilai Ijazah = (Rata2 Rapor Kls 4-6 * Bobot Rapor) + (Nilai US * Bobot US)
  // =========================================================================
  const rekapIjazahData = useMemo(() => {
    const rows = rombelStudents.map((student) => {
      const subjectScores: Record<
        string,
        {
          rapor: number | null;
          usTulis: number | null;
          usPraktik: number | null;
          usAkhir: number | null;
          nilaiIjazah: number | null;
        }
      > = {};

      let totalNilaiIjazah = 0;
      let countedSubjects = 0;

      activeSubjects.forEach((subj) => {
        // 1. Nilai Rata-rata Rapor (Semester 1 Kelas 4 s.d. Semester 2 Kelas 6)
        const studentRaporGrades = grades.filter(
          (g) =>
            g.student_id === student.id &&
            g.subject_id === subj.id &&
            raporSemesters.includes(g.semester) &&
            g.nilai_akhir !== null &&
            g.nilai_akhir !== undefined
        );

        let avgRapor: number | null = null;
        if (studentRaporGrades.length > 0) {
          const sum = studentRaporGrades.reduce((acc, curr) => acc + (curr.nilai_akhir || 0), 0);
          // Nilai Rapor dibulatkan tanpa koma (Contoh: 88)
          avgRapor = Math.round(sum / studentRaporGrades.length);
        }

        // 2. Nilai Ujian Sekolah (Tulis, Praktik, Nilai Akhir) - Dibulatkan tanpa koma (Contoh: 88)
        const usExam = schoolExams.find(
          (e) => e.student_id === student.id && e.subject_id === subj.id
        );

        const usTulis = usExam?.nilai_tulis != null ? Math.round(usExam.nilai_tulis) : null;
        const usPraktik = usExam?.nilai_praktik != null ? Math.round(usExam.nilai_praktik) : null;
        let usAkhir = usExam?.nilai != null ? Math.round(usExam.nilai) : null;

        if (usAkhir === null && (usTulis !== null || usPraktik !== null)) {
          if (usTulis !== null && usPraktik !== null) {
            usAkhir = Math.round((usTulis * 0.5) + (usPraktik * 0.5));
          } else {
            usAkhir = usTulis ?? usPraktik;
          }
        }

        // 3. Nilai Ijazah Berdasarkan Pembobotan (dua angka di belakang koma, contoh: 80,00)
        let finalIjazah: number | null = null;
        if (avgRapor !== null && usAkhir !== null) {
          finalIjazah = Number(
            ((avgRapor * (bobotRapor / 100)) + (usAkhir * (bobotUS / 100))).toFixed(2)
          );
        } else if (avgRapor !== null) {
          finalIjazah = Number(avgRapor.toFixed(2));
        } else if (usAkhir !== null) {
          finalIjazah = Number(usAkhir.toFixed(2));
        }

        if (finalIjazah !== null) {
          totalNilaiIjazah += finalIjazah;
          countedSubjects++;
        }

        subjectScores[subj.id] = {
          rapor: avgRapor,
          usTulis,
          usPraktik,
          usAkhir,
          nilaiIjazah: finalIjazah,
        };
      });

      const rataIjazah =
        countedSubjects > 0 ? Number((totalNilaiIjazah / countedSubjects).toFixed(2)) : 0;
      const isLulus = rataIjazah >= (settings.kktp_default || 75);

      return {
        student,
        subjectScores,
        totalIjazah: Number(totalNilaiIjazah.toFixed(2)),
        rataIjazah,
        status: isLulus ? 'LULUS' : 'TIDAK LULUS',
        peringkat: 0, // will be computed next
      };
    });

    // Compute Ranking (sorted descending by rataIjazah)
    rows.sort((a, b) => b.rataIjazah - a.rataIjazah);
    rows.forEach((r, idx) => {
      r.peringkat = idx + 1;
    });

    return rows;
  }, [rombelStudents, activeSubjects, grades, schoolExams, raporSemesters, bobotRapor, bobotUS, settings.kktp_default]);

  // Overall Statistics for Dashboard widgets
  const statsSummary = useMemo(() => {
    if (rekapIjazahData.length === 0) {
      return { totalSiswa: 0, tertinggi: 0, terendah: 0, rataRata: 0, lulusCount: 0 };
    }
    const totalSiswa = rekapIjazahData.length;
    const scores = rekapIjazahData.map((r) => r.rataIjazah);
    const tertinggi = Math.max(...scores);
    const terendah = Math.min(...scores);
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    const rataRata = Number((sum / totalSiswa).toFixed(2));
    const lulusCount = rekapIjazahData.filter((r) => r.status === 'LULUS').length;

    return { totalSiswa, tertinggi, terendah, rataRata, lulusCount };
  }, [rekapIjazahData]);

  // Handle Trigger Print
  const handleTriggerPrint = () => {
    let docTitle = 'Dokumen_Sekolah';
    if (activeTab === 'rekap_ijazah') {
      docTitle = `Rekap_Nilai_Ijazah_Kelas6_${selectedRombel}_F4_Landscape`;
    } else if (activeTab === 'surat_kelulusan') {
      if (sklPrintMode === 'batch') {
        docTitle = `SKL_Masal_Kelas6_${selectedRombel}_F4_Portrait`;
      } else {
        docTitle = `SKL_${currentStudent?.nama.replace(/[^a-zA-Z0-9]/g, '_')}_${currentStudent?.nisn}_F4_Portrait`;
      }
    } else if (activeTab === 'leger_semester') {
      docTitle = `Leger_Nilai_${selectedRombel}_${selectedSemester}`;
    } else if (activeTab === 'rapor_siswa') {
      docTitle = `Rapor_${currentStudent?.nama.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedSemester}`;
    }

    PrintService.triggerPrint({
      orientation: paperOrientation,
      paperSize,
      title: docTitle,
    });
  };

  // Handle Export Excel for Rekapitulasi Ijazah
  const handleExportExcelIjazah = () => {
    const exportRows = rekapIjazahData.map((r) => ({
      peringkat: r.peringkat,
      nis: r.student.nis,
      nisn: r.student.nisn,
      nama: r.student.nama,
      gender: r.student.jenis_kelamin,
      rombel: r.student.rombel,
      subjectScores: r.subjectScores,
      totalIjazah: r.totalIjazah,
      rataIjazah: r.rataIjazah,
      status: r.status,
    }));

    ExcelService.exportRekapIjazahToExcel(
      exportRows,
      activeSubjects,
      settings,
      selectedRombel,
      bobotRapor,
      bobotUS
    );
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* TOP DASHBOARD NAVIGATION & STATS (Hidden during print)    */}
      {/* ========================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 no-print">
        {/* Title & Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200/80 mb-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Pusat Cetak Dokumen Kelulusan & Ijazah SDN Babelan Kota 01</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dashboard Cetak Dokumen & Kelulusan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Format cetak resmi Rekapitulasi Nilai Ijazah (Kertas F4 Landscape 330×210mm) dan Surat Keterangan Lulus (SKL).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeTab === 'rekap_ijazah' && (
              <button
                type="button"
                onClick={handleExportExcelIjazah}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Unduh file Excel Rekap Nilai Ijazah lengkap"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel Ijazah</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleTriggerPrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Buka dialog cetak atau Simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh PDF</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => handleTabChange('rekap_ijazah')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rekap_ijazah'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Rekapitulasi Nilai Ijazah</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('surat_kelulusan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'surat_kelulusan'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Cetak SKL</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('leger_semester')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'leger_semester'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Leger Rombel</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('rapor_siswa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rapor_siswa'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Rapor Peserta Didik</span>
          </button>
        </div>

        {/* Global Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Rombel Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Pilih Rombel Kelas 6
            </label>
            <select
              disabled={!isAdmin && Boolean(currentUser?.rombel)}
              value={selectedRombel}
              onChange={(e) => setSelectedRombel(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500 cursor-pointer disabled:bg-slate-100"
            >
              {rombels
                .filter((r) => r.kelas === '6')
                .map((r) => (
                  <option key={r.id} value={r.nama}>
                    Rombel {r.nama} (Wali: {r.wali_kelas})
                  </option>
                ))}
              {isAdmin && <option value="ALL">Semua Kelas 6 (6A - 6D Gabungan)</option>}
            </select>
          </div>

          {/* Paper Size & Orientation Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Kertas & Orientasi Cetak
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                className="w-full text-xs font-semibold px-2.5 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="F4">F4 / Folio (330x210 mm)</option>
                <option value="A4">A4 (297x210 mm)</option>
              </select>

              <select
                value={paperOrientation}
                onChange={(e) => setPaperOrientation(e.target.value as 'landscape' | 'portrait')}
                className="w-full text-xs font-semibold px-2.5 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="landscape">Landscape (Mendatar)</option>
                <option value="portrait">Portrait (Tegak)</option>
              </select>
            </div>
          </div>

          {/* Bobot Selector (Specifically for Rekap Ijazah & SKL) */}
          {(activeTab === 'rekap_ijazah' || activeTab === 'surat_kelulusan') && (
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Pembobotan Nilai Ijazah (Rapor vs Ujian Sekolah)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBobotRapor(40)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    bobotRapor === 40
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  40% Rapor : 60% US (Umum)
                </button>

                <button
                  type="button"
                  onClick={() => setBobotRapor(30)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    bobotRapor === 30
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  30% Rapor : 70% US (Regulasi)
                </button>

                <button
                  type="button"
                  onClick={() => setBobotRapor(50)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    bobotRapor === 50
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  50% : 50%
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-auto">
                  <span>Bobot Aktif:</span>
                  <span className="font-bold text-blue-700">{bobotRapor}% Rapor</span>
                  <span>+</span>
                  <span className="font-bold text-indigo-700">{bobotUS}% US</span>
                </div>
              </div>
            </div>
          )}

          {/* Student selection for SKL or individual report */}
          {(activeTab === 'surat_kelulusan' || activeTab === 'rapor_siswa') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Pilih Peserta Didik
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500 cursor-pointer"
              >
                {rombelStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.nisn}) - {s.rombel}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Semester selection for Leger or Rapor */}
          {(activeTab === 'leger_semester' || activeTab === 'rapor_siswa') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Semester Rapor
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value as SemesterCode)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="Smt1_Kls6">Kelas 6 - Semester 1 (Ganjil)</option>
                <option value="Smt2_Kls6">Kelas 6 - Semester 2 (Genap)</option>
                <option value="Smt1_Kls5">Kelas 5 - Semester 1</option>
                <option value="Smt2_Kls5">Kelas 5 - Semester 2</option>
                <option value="Smt1_Kls4">Kelas 4 - Semester 1</option>
                <option value="Smt2_Kls4">Kelas 4 - Semester 2</option>
              </select>
            </div>
          )}
        </div>

        {/* Quick Bento Stats (For Rekap Ijazah) */}
        {activeTab === 'rekap_ijazah' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Total Siswa</span>
              <p className="text-xl font-black text-blue-950 mt-0.5">{statsSummary.totalSiswa} Siswa</p>
              <span className="text-[10px] text-blue-600 font-medium">Rombel {selectedRombel}</span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Kelulusan</span>
              <p className="text-xl font-black text-emerald-950 mt-0.5">
                {statsSummary.totalSiswa > 0
                  ? `${Math.round((statsSummary.lulusCount / statsSummary.totalSiswa) * 100)}%`
                  : '0%'}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">
                {statsSummary.lulusCount} dari {statsSummary.totalSiswa} Lulus
              </span>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Rata-rata Ijazah</span>
              <p className="text-xl font-black text-indigo-950 mt-0.5">{formatDuaDesimal(statsSummary.rataRata)}</p>
              <span className="text-[10px] text-indigo-600 font-medium">KKTP Acuan: {settings.kktp_default}</span>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Nilai Tertinggi / Terendah</span>
              <p className="text-xl font-black text-amber-950 mt-0.5">
                {formatDuaDesimal(statsSummary.tertinggi)} / {formatDuaDesimal(statsSummary.terendah)}
              </p>
              <span className="text-[10px] text-amber-700 font-medium">Rentang Nilai Ijazah</span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REKAPITULASI NILAI IJAZAH (F4 LANDSCAPE 330 x 210 mm)               */}
      {/* ========================================================================= */}
      {activeTab === 'rekap_ijazah' && (
        <div id="rekap-ijazah-container" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 printable-card">
          {/* Table Toolbar (Screen only) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Tampilan Kolom Nilai:</span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setIjazahViewMode('standar')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    ijazahViewMode === 'standar' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilkan Nilai Rapor, Nilai US, dan Nilai Ijazah per Mapel"
                >
                  Standar (Rapor + US + Ijazah)
                </button>
                <button
                  type="button"
                  onClick={() => setIjazahViewMode('detail')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    ijazahViewMode === 'detail' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilkan rincian Tulis dan Praktik Ujian Sekolah"
                >
                  Detail (Tulis & Praktek)
                </button>
                <button
                  type="button"
                  onClick={() => setIjazahViewMode('ringkas')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    ijazahViewMode === 'ringkas' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilkan Nilai Ijazah per Mapel saja"
                >
                  Ringkas (Nilai Ijazah Saja)
                </button>
              </div>
            </div>
          </div>

          {/* Official Printable Kop Sekolah (Always visible during print) */}
          <div className="hidden print:flex items-center gap-4 border-b-2 border-black pb-3 mb-4 font-serif">
            <img
              src={settings.logo_url || 'https://i.ibb.co.com/rRhHc2PD/logo-bakot-01.png'}
              alt="Logo Sekolah"
              className="w-16 h-16 object-contain shrink-0"
            />
            <div className="flex-1 text-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                PEMERINTAH KABUPATEN BEKASI • DINAS PENDIDIKAN
              </h3>
              <h1 className="text-base font-black text-slate-900 tracking-tight">{settings.nama_sekolah}</h1>
              <p className="text-[10px] text-slate-600">
                {settings.alamat_sekolah} • NSS: {settings.nss || '101022204001'} • NPSN: {settings.npsn || '20218342'}
              </p>
              <p className="text-xs font-bold mt-1 text-slate-900 underline uppercase">
                DAFTAR REKAPITULASI NILAI IJAZAH KELAS 6 • TAHUN AJARAN {settings.tahun_ajaran}
              </p>
              <p className="text-[10px] text-slate-700 italic">
                Rombel: {selectedRombel} • Format Kertas: F4 Landscape (330 x 210 mm) • Pembobotan: {bobotRapor}% Nilai Rapor (Kls 4-6) + {bobotUS}% Nilai Ujian Sekolah (Tulis & Praktek)
              </p>
            </div>
          </div>

          {/* On-screen Header Info */}
          <div className="text-center space-y-1 no-print">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
              DAFTAR REKAPITULASI NILAI IJAZAH KELAS 6
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              SDN BABELAN KOTA 01 • Rombel {selectedRombel} • Tahun Ajaran {settings.tahun_ajaran}
            </p>
          </div>

          {/* ========================================================= */}
          {/* THE MASTER F4 LANDSCAPE RECAPITULATION TABLE              */}
          {/* ========================================================= */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] sm:text-[11px] border-collapse border border-slate-900 font-sans">
              <thead>
                {/* Row 1: Multi-level Column Grouping */}
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-900 text-center">
                  <th rowSpan={2} className="border border-slate-900 p-1 w-7">No</th>
                  <th rowSpan={2} className="border border-slate-900 p-1 w-16">NIS</th>
                  <th rowSpan={2} className="border border-slate-900 p-1 w-20">NISN</th>
                  <th rowSpan={2} className="border border-slate-900 p-1 text-left min-w-[130px]">Nama Peserta Didik</th>
                  <th rowSpan={2} className="border border-slate-900 p-1 w-7">L/P</th>

                  {/* Subject Group Columns */}
                  {activeSubjects.map((subj) => {
                    let colSpan = 3;
                    if (ijazahViewMode === 'detail') colSpan = 5;
                    if (ijazahViewMode === 'ringkas') colSpan = 1;

                    return (
                      <th
                        key={subj.id}
                        colSpan={colSpan}
                        className="border border-slate-900 p-1 text-center bg-slate-100"
                        title={subj.nama_mapel}
                      >
                        {subj.kode}
                      </th>
                    );
                  })}

                  {/* Final Summary Columns */}
                  <th rowSpan={2} className="border border-slate-900 p-1 w-14 bg-slate-200 text-center">
                    Jumlah
                  </th>
                  <th rowSpan={2} className="border border-slate-900 p-1 w-14 bg-slate-200 text-center">
                    Rata2
                  </th>
                  <th rowSpan={2} className="border border-slate-900 p-1 w-16 text-center">
                    Status
                  </th>
                  <th rowSpan={2} className="border border-slate-900 p-1 w-8 text-center bg-amber-100/70">
                    Rank
                  </th>
                </tr>

                {/* Row 2: Sub-headers for Subjects */}
                <tr className="bg-slate-50 text-slate-800 text-[9px] font-bold border-b border-slate-900 text-center">
                  {activeSubjects.map((subj) => {
                    if (ijazahViewMode === 'detail') {
                      return (
                        <React.Fragment key={`${subj.id}_sub`}>
                          <th className="border border-slate-900 p-0.5 w-8" title="Rata-rata Rapor Semester 1 Kls 4 s.d. Semester 2 Kls 6">Rpr</th>
                          <th className="border border-slate-900 p-0.5 w-8" title="Nilai Ujian Sekolah Tulis">Tul</th>
                          <th className="border border-slate-900 p-0.5 w-8" title="Nilai Ujian Sekolah Praktik">Prk</th>
                          <th className="border border-slate-900 p-0.5 w-8" title="Nilai Akhir Ujian Sekolah">US</th>
                          <th className="border border-slate-900 p-0.5 w-9 bg-blue-50 font-bold" title="Nilai Akhir Ijazah">NI</th>
                        </React.Fragment>
                      );
                    } else if (ijazahViewMode === 'ringkas') {
                      return (
                        <th key={`${subj.id}_sub`} className="border border-slate-900 p-0.5 w-10 bg-blue-50 font-bold" title="Nilai Ijazah">
                          NI
                        </th>
                      );
                    } else {
                      // Standard View
                      return (
                        <React.Fragment key={`${subj.id}_sub`}>
                          <th className="border border-slate-900 p-0.5 w-9" title="Rata-rata Rapor (Kls 4-6)">Rapor</th>
                          <th className="border border-slate-900 p-0.5 w-9" title="Nilai Akhir Ujian Sekolah">US</th>
                          <th className="border border-slate-900 p-0.5 w-10 bg-blue-50 font-bold" title="Nilai Ijazah">Ijazah</th>
                        </React.Fragment>
                      );
                    }
                  })}
                </tr>
              </thead>

              <tbody>
                {rekapIjazahData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5 + activeSubjects.length * (ijazahViewMode === 'detail' ? 5 : ijazahViewMode === 'ringkas' ? 1 : 3) + 4}
                      className="border border-slate-900 p-8 text-center text-slate-400 font-sans"
                    >
                      Tidak ada data siswa atau nilai untuk rombel ini.
                    </td>
                  </tr>
                ) : (
                  rekapIjazahData.map((row, idx) => (
                    <tr key={row.student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="border border-slate-900 p-1 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-900 p-1 font-mono text-center">{row.student.nis}</td>
                      <td className="border border-slate-900 p-1 font-mono text-center">{row.student.nisn}</td>
                      <td className="border border-slate-900 p-1 font-bold text-slate-900">{row.student.nama}</td>
                      <td className="border border-slate-900 p-1 text-center font-semibold">{row.student.jenis_kelamin}</td>

                      {/* Subject Scores */}
                      {activeSubjects.map((subj) => {
                        const score = row.subjectScores[subj.id];
                        if (ijazahViewMode === 'detail') {
                          return (
                            <React.Fragment key={subj.id}>
                              <td className="border border-slate-900 p-1 text-center font-mono text-slate-700">{formatBulat(score?.rapor)}</td>
                              <td className="border border-slate-900 p-1 text-center font-mono text-slate-600">{formatBulat(score?.usTulis)}</td>
                              <td className="border border-slate-900 p-1 text-center font-mono text-slate-600">{formatBulat(score?.usPraktik)}</td>
                              <td className="border border-slate-900 p-1 text-center font-mono font-medium text-slate-800">{formatBulat(score?.usAkhir)}</td>
                              <td className="border border-slate-900 p-1 text-center font-mono font-bold bg-blue-50/70 text-blue-950">
                                {formatDuaDesimal(score?.nilaiIjazah)}
                              </td>
                            </React.Fragment>
                          );
                        } else if (ijazahViewMode === 'ringkas') {
                          return (
                            <td key={subj.id} className="border border-slate-900 p-1 text-center font-mono font-bold bg-blue-50/70 text-blue-950">
                              {formatDuaDesimal(score?.nilaiIjazah)}
                            </td>
                          );
                        } else {
                          // Standard View
                          return (
                            <React.Fragment key={subj.id}>
                              <td className="border border-slate-900 p-1 text-center font-mono text-slate-700">{formatBulat(score?.rapor)}</td>
                              <td className="border border-slate-900 p-1 text-center font-mono font-medium text-slate-800">{formatBulat(score?.usAkhir)}</td>
                              <td className="border border-slate-900 p-1 text-center font-mono font-bold bg-blue-50/70 text-blue-950">
                                {formatDuaDesimal(score?.nilaiIjazah)}
                              </td>
                            </React.Fragment>
                          );
                        }
                      })}

                      {/* Summary Columns */}
                      <td className="border border-slate-900 p-1 text-center font-bold bg-slate-50 text-slate-900 font-mono">
                        {formatDuaDesimal(row.totalIjazah)}
                      </td>
                      <td className="border border-slate-900 p-1 text-center font-black bg-slate-100 text-slate-900 font-mono">
                        {formatDuaDesimal(row.rataIjazah)}
                      </td>
                      <td className="border border-slate-900 p-1 text-center font-bold text-emerald-800">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 border border-emerald-300">
                          {row.status}
                        </span>
                      </td>
                      <td className="border border-slate-900 p-1 text-center font-bold bg-amber-50 text-amber-900 font-mono">
                        {row.peringkat}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Statistical Footer */}
              {rekapIjazahData.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-center">
                    <td colSpan={5} className="border border-slate-900 p-1.5 text-right font-black uppercase">
                      Rata-rata Rombel
                    </td>
                    {activeSubjects.map((subj) => {
                      const subjectIjazahScores = rekapIjazahData
                        .map((r) => r.subjectScores[subj.id]?.nilaiIjazah)
                        .filter((v): v is number => v !== null && v !== undefined);
                      const avg =
                        subjectIjazahScores.length > 0
                          ? Number((subjectIjazahScores.reduce((a, b) => a + b, 0) / subjectIjazahScores.length).toFixed(2))
                          : null;

                      if (ijazahViewMode === 'detail') {
                        return (
                          <React.Fragment key={`avg_${subj.id}`}>
                            <td colSpan={4} className="border border-slate-900 p-1 text-center text-slate-500 text-[9px]">-</td>
                            <td className="border border-slate-900 p-1 text-center font-bold bg-blue-100 text-blue-900 font-mono">{formatDuaDesimal(avg)}</td>
                          </React.Fragment>
                        );
                      } else if (ijazahViewMode === 'ringkas') {
                        return (
                          <td key={`avg_${subj.id}`} className="border border-slate-900 p-1 text-center font-bold bg-blue-100 text-blue-900 font-mono">
                            {formatDuaDesimal(avg)}
                          </td>
                        );
                      } else {
                        return (
                          <React.Fragment key={`avg_${subj.id}`}>
                            <td colSpan={2} className="border border-slate-900 p-1 text-center text-slate-500 text-[9px]">-</td>
                            <td className="border border-slate-900 p-1 text-center font-bold bg-blue-100 text-blue-900 font-mono">{formatDuaDesimal(avg)}</td>
                          </React.Fragment>
                        );
                      }
                    })}
                    <td className="border border-slate-900 p-1.5 text-center font-black bg-slate-200 font-mono">
                      {formatDuaDesimal(statsSummary.rataRata * activeSubjects.length)}
                    </td>
                    <td className="border border-slate-900 p-1.5 text-center font-black bg-slate-200 font-mono">
                      {formatDuaDesimal(statsSummary.rataRata)}
                    </td>
                    <td colSpan={2} className="border border-slate-900 p-1.5 text-center text-[10px] text-emerald-800 font-bold">
                      {statsSummary.lulusCount} / {statsSummary.totalSiswa} (100% Lulus)
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Tanda Tangan Resmi Rekapitulasi Ijazah (Print Only) */}
          <div className="hidden print:grid grid-cols-2 gap-12 pt-8 text-xs font-serif text-center avoid-page-break">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala SDN BABELAN KOTA 01</p>
              <div className="h-20"></div>
              <p className="font-bold underline uppercase">{settings.nama_kepsek || 'Lailatul Fajriah, S.Pd.SD'}</p>
              <p>NIP. {settings.nip_kepsek || '197808202008012005'}</p>
            </div>

            <div>
              <p>{settings.kecamatan || 'Babelan'}, {tanggalCetak}</p>
              <p className="font-bold">Guru Kelas 6 / Ketua Panitia Ujian Sekolah</p>
              <div className="h-20"></div>
              <p className="font-bold underline uppercase">
                {currentRombelInfo?.wali_kelas || currentUser?.nama || 'Siti Rahmawati, S.Pd.'}
              </p>
              <p>NIP. {currentRombelInfo?.nip_wali_kelas || currentRombelInfo?.nip_wali || currentUser?.nip || '19790415 200501 2 008'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CETAK SURAT KETERANGAN LULUS (SKL)                                 */}
      {/* ========================================================================= */}
      {activeTab === 'surat_kelulusan' && (
        <div className="space-y-6">
          {/* Controls Bar for SKL (Screen Only) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Pengaturan SKL</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="btn-unduh-pdf-masal"
                  onClick={handleUnduhPdfMasal}
                  disabled={isDownloadingPdf}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  title="Unduh PDF masal seluruh siswa dalam rombel langsung ke penyimpanan perangkat (ukuran resmi F4 Portrait 210x330mm)"
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{isDownloadingPdf ? 'Menyimpan ke Perangkat...' : 'Unduh PDF masal'}</span>
                  <span className="bg-blue-700/90 text-blue-100 px-2 py-0.5 rounded text-[10px] font-mono">
                    F4 Portrait 210×330mm
                  </span>
                </button>

                {sklPrintMode === 'single' && currentStudent && (
                  <button
                    type="button"
                    id="btn-unduh-pdf-single"
                    onClick={handleUnduhPdfSingle}
                    disabled={isDownloadingPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs transition-all cursor-pointer"
                    title={`Unduh PDF khusus siswa ${currentStudent.nama} langsung ke penyimpanan perangkat`}
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Unduh PDF Siswa Ini</span>
                  </button>
                )}

                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSklPrintMode('single')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      sklPrintMode === 'single'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Pratinjau lembar kerja SKL untuk 1 siswa terpilih"
                  >
                    Preview Per Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setSklPrintMode('batch')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      sklPrintMode === 'batch'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Pratinjau lembar kerja SKL seluruh siswa dalam rombel"
                  >
                    Preview Semua ({rombelStudents.length} Siswa)
                  </button>
                </div>
              </div>
            </div>

            {/* Editable SKL Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nomor Surat SKL</label>
                <input
                  type="text"
                  value={sklNomorSurat}
                  onChange={(e) => setSklNomorSurat(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Tanggal Kelulusan</label>
                <input
                  type="text"
                  value={sklTanggalLulus}
                  onChange={(e) => setSklTanggalLulus(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Tanggal Rapat Dewan Guru</label>
                <input
                  type="text"
                  value={sklTanggalRapat}
                  onChange={(e) => setSklTanggalRapat(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Kota Penerbitan</label>
                <input
                  type="text"
                  value={sklKota}
                  onChange={(e) => setSklKota(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* THE OFFICIAL SKL DOCUMENT TEMPLATE                        */}
          {/* Supports Single student view OR Batch print of all rombel */}
          {/* ========================================================= */}
          {sklPrintMode === 'single' ? (
            // SINGLE SKL DOCUMENT
            <div
              id="skl-single-card"
              data-student-name={currentStudent?.nama || ''}
              data-student-nisn={currentStudent?.nisn || ''}
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
              className="bg-white p-8 sm:p-10 max-w-[760px] mx-auto printable-card font-['Arial',sans-serif] skl-page skl-single-page shadow-xs"
            >
              {currentStudent ? (
                <SKLDocument
                  student={currentStudent}
                  settings={settings}
                  activeSubjects={activeSubjects}
                  rekapRow={rekapIjazahData.find((r) => r.student.id === currentStudent.id)}
                  nomorSurat={sklNomorSurat}
                  tanggalLulus={sklTanggalLulus}
                  tanggalRapat={sklTanggalRapat}
                  kota={sklKota}
                  bobotRapor={bobotRapor}
                  bobotUS={bobotUS}
                />
              ) : (
                <div className="text-center py-12 text-slate-400">Pilih siswa untuk menampilkan SKL.</div>
              )}
            </div>
          ) : (
            // BATCH PRINT: ALL STUDENTS IN ROMBEL (A4 PORTRAIT 21 x 29.7 cm)
            <div className="space-y-8">
              <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs p-3.5 rounded-xl no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Pratinjau <strong>{rombelStudents.length} Dokumen SKL</strong> (Rombel {selectedRombel}). Setiap siswa diformat pas pada 1 lembar halaman terpisah ukuran <strong>A4 Portrait (21×29.7 cm)</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleUnduhPdfMasal}
                  disabled={isDownloadingPdf}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold cursor-pointer shadow-xs shrink-0"
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isDownloadingPdf ? 'Menyimpan...' : 'Unduh PDF masal'}</span>
                </button>
              </div>

              {rombelStudents.map((std) => (
                <div
                  key={std.id}
                  id={`skl-batch-card-${std.id}`}
                  data-student-name={std.nama}
                  data-student-nisn={std.nisn || ''}
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                  className="bg-white p-8 sm:p-10 max-w-[760px] mx-auto printable-card font-['Arial',sans-serif] skl-page skl-batch-page page-break avoid-page-break shadow-xs"
                >
                  <SKLDocument
                    student={std}
                    settings={settings}
                    activeSubjects={activeSubjects}
                    rekapRow={rekapIjazahData.find((r) => r.student.id === std.id)}
                    nomorSurat={sklNomorSurat}
                    tanggalLulus={sklTanggalLulus}
                    tanggalRapat={sklTanggalRapat}
                    kota={sklKota}
                    bobotRapor={bobotRapor}
                    bobotUS={bobotUS}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BUKU LEGER NILAI SEMESTER (A4 / F4 LANDSCAPE)                       */}
      {/* ========================================================================= */}
      {activeTab === 'leger_semester' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 printable-card">
          {/* Printable Kop */}
          <div className="hidden print:flex items-center gap-4 border-b-2 border-black pb-3 mb-4 font-serif">
            <img
              src={settings.logo_url || 'https://i.ibb.co.com/rRhHc2PD/logo-bakot-01.png'}
              alt="Logo"
              className="w-16 h-16 object-contain shrink-0"
            />
            <div className="flex-1 text-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                PEMERINTAH KABUPATEN BEKASI • DINAS PENDIDIKAN
              </h3>
              <h1 className="text-base font-black text-slate-900 tracking-tight">{settings.nama_sekolah}</h1>
              <p className="text-[10px] text-slate-600">
                {settings.alamat_sekolah} • NSS: {settings.nss || '-'} • NPSN: {settings.npsn || '-'}
              </p>
              <p className="text-xs font-bold mt-1 text-slate-900 underline uppercase">
                BUKU LEGER NILAI RAPOR ROMBEL {selectedRombel} • {selectedSemester.replace('_', ' ')} • T.A. {settings.tahun_ajaran}
              </p>
            </div>
          </div>

          <div className="text-center space-y-1 no-print">
            <h2 className="text-base font-bold uppercase tracking-wider underline">
              BUKU LEGER NILAI RAPOR KELAS
            </h2>
            <p className="text-xs font-sans text-slate-600">
              Rombel {selectedRombel} • {selectedSemester.replace('_', ' ')} • Tahun Ajaran {settings.tahun_ajaran}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] border-collapse border border-slate-900 font-sans">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-900 text-center">
                  <th className="border border-slate-900 p-1.5 w-6">No</th>
                  <th className="border border-slate-900 p-1.5 w-20">NISN</th>
                  <th className="border border-slate-900 p-1.5 text-left min-w-[120px]">Nama Siswa</th>
                  <th className="border border-slate-900 p-1.5 w-6">L/P</th>
                  {activeSubjects.map((s) => (
                    <th key={s.id} className="border border-slate-900 p-1.5 text-center">
                      {s.kode}
                    </th>
                  ))}
                  <th className="border border-slate-900 p-1.5 text-center bg-slate-200">Total</th>
                  <th className="border border-slate-900 p-1.5 text-center bg-slate-200">Rata2</th>
                </tr>
              </thead>
              <tbody>
                {rombelStudents.map((s, idx) => {
                  const studentGrades = activeSubjects.map((subj) => {
                    const g = grades.find(
                      (gr) =>
                        gr.student_id === s.id &&
                        gr.subject_id === subj.id &&
                        gr.semester === selectedSemester
                    );
                    return g?.nilai_akhir ?? null;
                  });

                  const validScores = studentGrades.filter((v): v is number => v !== null);
                  const total = validScores.reduce((acc, curr) => acc + curr, 0);
                  const avg = validScores.length > 0 ? (total / validScores.length).toFixed(1) : '-';

                  return (
                    <tr key={s.id}>
                      <td className="border border-slate-900 p-1 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-900 p-1 font-mono">{s.nisn}</td>
                      <td className="border border-slate-900 p-1 font-bold">{s.nama}</td>
                      <td className="border border-slate-900 p-1 text-center">{s.jenis_kelamin}</td>
                      {studentGrades.map((val, i) => (
                        <td key={i} className="border border-slate-900 p-1 text-center font-medium">
                          {val ?? '-'}
                        </td>
                      ))}
                      <td className="border border-slate-900 p-1 text-center font-bold bg-slate-50">
                        {total > 0 ? total : '-'}
                      </td>
                      <td className="border border-slate-900 p-1 text-center font-bold bg-slate-50">
                        {avg}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tanda tangan leger */}
          <div className="hidden print:grid grid-cols-2 gap-8 pt-8 text-xs font-serif text-center avoid-page-break">
            <div>
              <p>Mengetahui,</p>
              <p>Kepala {settings.nama_sekolah}</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{settings.nama_kepsek || '-'}</p>
              <p>NIP. {settings.nip_kepsek || '-'}</p>
            </div>
            <div>
              <p>{settings.kecamatan || 'Babelan'}, {tanggalCetak}</p>
              <p>Guru Kelas / Rombel {selectedRombel}</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{currentRombelInfo?.wali_kelas || currentUser?.nama || '-'}</p>
              <p>NIP. {currentRombelInfo?.nip_wali_kelas || currentUser?.nip || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RAPOR PESERTA DIDIK (PER SISWA)                                    */}
      {/* ========================================================================= */}
      {activeTab === 'rapor_siswa' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 printable-card font-serif">
          {/* Official Printable Kop */}
          <div className="flex items-center gap-4 border-b-2 border-black pb-3 mb-4 font-serif">
            <img
              src={settings.logo_url || 'https://i.ibb.co.com/rRhHc2PD/logo-bakot-01.png'}
              alt="Logo"
              className="w-16 h-16 object-contain shrink-0"
            />
            <div className="flex-1 text-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                PEMERINTAH KABUPATEN BEKASI • DINAS PENDIDIKAN
              </h3>
              <h1 className="text-base font-black text-slate-900 tracking-tight">{settings.nama_sekolah}</h1>
              <p className="text-[10px] text-slate-600">
                {settings.alamat_sekolah} • NSS: {settings.nss || '-'} • NPSN: {settings.npsn || '-'}
              </p>
              <p className="text-xs font-bold mt-1 text-slate-900 underline uppercase">
                LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPOR)
              </p>
            </div>
          </div>

          {/* Student Identitas Box */}
          {currentStudent && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs pb-3 border-b border-slate-200">
              <div className="flex">
                <span className="w-32 font-bold">Nama Peserta Didik</span>
                <span>: {currentStudent.nama}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-bold">Kelas / Rombel</span>
                <span>: Kelas {currentStudent.kelas} ({currentStudent.rombel})</span>
              </div>
              <div className="flex">
                <span className="w-32 font-bold">NIS / NISN</span>
                <span>: {currentStudent.nis} / {currentStudent.nisn}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-bold">Semester / T.A.</span>
                <span>: {selectedSemester.includes('2') ? 'Semester 2 (Genap)' : 'Semester 1 (Ganjil)'} / {settings.tahun_ajaran}</span>
              </div>
            </div>
          )}

          {/* Table Nilai Rapor Siswa */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-900">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-900 text-center">
                  <th className="border border-slate-900 p-2 w-8">No</th>
                  <th className="border border-slate-900 p-2 text-left">Muatan Mata Pelajaran</th>
                  <th className="border border-slate-900 p-2 w-16">KKTP</th>
                  <th className="border border-slate-900 p-2 w-20">Nilai Akhir</th>
                  <th className="border border-slate-900 p-2 w-16">Predikat</th>
                  <th className="border border-slate-900 p-2 text-left">Capaian Kompetensi / Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {activeSubjects.map((subj, idx) => {
                  const gr = grades.find(
                    (g) =>
                      g.student_id === currentStudent?.id &&
                      g.subject_id === subj.id &&
                      g.semester === selectedSemester
                  );

                  return (
                    <tr key={subj.id}>
                      <td className="border border-slate-900 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-900 p-2 font-bold">{subj.nama_mapel}</td>
                      <td className="border border-slate-900 p-2 text-center">{subj.kktp || 75}</td>
                      <td className="border border-slate-900 p-2 text-center font-bold text-sm">
                        {gr?.nilai_akhir ?? '-'}
                      </td>
                      <td className="border border-slate-900 p-2 text-center font-bold">
                        {gr?.predikat ?? '-'}
                      </td>
                      <td className="border border-slate-900 p-2 text-[11px] leading-relaxed">
                        {gr?.catatan ||
                          (gr?.nilai_akhir && gr.nilai_akhir >= (subj.kktp || 75)
                            ? 'Menunjukkan penguasaan capaian kompetensi materi pembelajaran yang baik dan tuntas.'
                            : 'Perlu bimbingan dan peningkatan dalam memahami beberapa tujuan pembelajaran.')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tanda Tangan Rapor */}
          <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs font-serif avoid-page-break">
            <div>
              <p>Mengetahui,</p>
              <p>Orang Tua / Wali Murid,</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{currentStudent?.orang_tua || '....................................'}</p>
            </div>
            <div>
              <p>{settings.kecamatan || 'Babelan'}, {tanggalCetak}</p>
              <p>Guru Kelas / Rombel {selectedRombel}</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{currentRombelInfo?.wali_kelas || currentUser?.nama || '....................................'}</p>
              <p>NIP. {currentRombelInfo?.nip_wali_kelas || currentUser?.nip || '-'}</p>
            </div>
            <div>
              <p>Mengetahui,</p>
              <p>Kepala {settings.nama_sekolah}</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{settings.nama_kepsek || '-'}</p>
              <p>NIP. {settings.nip_kepsek || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PROGRES UNDUH PDF MASAL KE PENYIMPANAN PERANGKAT                    */}
      {/* ========================================================================= */}
      {isDownloadingPdf && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                <Download className="w-6 h-6 animate-bounce text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900">
                  Mengunduh PDF ke Penyimpanan Perangkat
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  Standar F4 Portrait (210 × 330 mm) • Rombel {selectedRombel}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700">
                  {downloadProgress.total > 0
                    ? `Memproses ${downloadProgress.current} dari ${downloadProgress.total} Halaman`
                    : 'Menyiapkan dokumen...'}
                </span>
                <span className="text-blue-600 font-mono font-bold">
                  {downloadProgress.total > 0
                    ? `${Math.round((downloadProgress.current / downloadProgress.total) * 100)}%`
                    : '0%'}
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-200 ease-out"
                  style={{
                    width: `${
                      downloadProgress.total > 0
                        ? Math.max(5, Math.round((downloadProgress.current / downloadProgress.total) * 100))
                        : 5
                    }%`,
                  }}
                />
              </div>

              {downloadProgress.studentName && (
                <div className="text-[11px] text-slate-600 truncate flex items-center gap-1.5 pt-0.5">
                  <span className="text-slate-400 shrink-0">Siswa:</span>
                  <span className="font-bold text-slate-800 truncate">
                    {downloadProgress.studentName}
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-blue-50/80 border border-blue-200/90 p-3.5 text-xs text-blue-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-blue-900">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Langsung Menuju Penyimpanan Perangkat</span>
              </div>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                Setelah seluruh halaman siap, file PDF akan langsung diunduh otomatis ke folder <strong>Download / Unduhan</strong> di perangkat Anda tanpa perlu setting manual.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  cancelPdfRef.current = true;
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: OFFICIAL SURAT KETERANGAN LULUS (SKL) DOCUMENT TEMPLATE
// =========================================================================
interface SKLDocumentProps {
  student: Student;
  settings: any;
  activeSubjects: any[];
  rekapRow?: any;
  nomorSurat: string;
  tanggalLulus: string;
  tanggalRapat: string;
  kota: string;
  bobotRapor: number;
  bobotUS: number;
}

const SKLDocument: React.FC<SKLDocumentProps> = ({
  student,
  settings,
  activeSubjects,
  rekapRow,
  nomorSurat,
  tanggalLulus,
  tanggalRapat,
  kota,
  bobotRapor,
  bobotUS,
}) => {
  return (
    <div
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      className="space-y-3 text-black leading-snug text-[11pt] font-['Arial',sans-serif]"
    >
      {/* Kop Resmi Sekolah: Sama Rata Kiri Kanan */}
      {settings.kop_skl_url ? (
        <div className="relative group text-center pb-1 mb-2 border-b-2 border-black w-full">
          <img
            src={settings.kop_skl_url}
            alt="Kop Surat Resmi Sekolah"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            className="w-full h-auto object-contain mx-auto block"
          />
        </div>
      ) : (
        <div className="relative group flex items-center justify-between gap-3 border-b-4 border-double border-black pb-2 text-center w-full">
          {/* Sisi Kiri: Logo Pemda / Sekolah */}
          <div className="w-20 h-20 shrink-0 flex items-center justify-center">
            <img
              src={settings.logo_url || 'https://i.ibb.co.com/rRhHc2PD/logo-bakot-01.png'}
              alt="Logo Sekolah / Pemda"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="w-16 h-16 object-contain"
            />
          </div>

          {/* Bagian Tengah: Teks Instansi Sekolah (Tepat di Tengah & Sama Rata Kiri Kanan) */}
          <div className="flex-1 text-center px-1">
            <h4 className="text-[11pt] font-bold uppercase tracking-wider text-black leading-tight">
              PEMERINTAH KABUPATEN BEKASI
            </h4>
            <h3 className="text-[11pt] font-bold uppercase tracking-wide text-black leading-tight">
              DINAS PENDIDIKAN
            </h3>
            <h1 className="text-[14pt] font-bold tracking-tight text-black uppercase leading-tight my-0.5">
              {settings.nama_sekolah}
            </h1>
            <p className="text-[9pt] text-black leading-tight not-italic">
              {settings.alamat_sekolah} • NSS: {settings.nss || '101022204001'} • NPSN: {settings.npsn || '20218342'}
            </p>
            <p className="text-[8.5pt] text-black leading-tight">
              Kecamatan {settings.kecamatan}, Kabupaten {settings.kabupaten}, Provinsi {settings.provinsi}
            </p>
          </div>

          {/* Sisi Kanan: Logo Tut Wuri Handayani (Menyeimbangkan Sisi Kanan Sama Rata) */}
          <div className="w-20 h-20 shrink-0 flex items-center justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_Tut_Wuri_Handayani.png/240px-Logo_Tut_Wuri_Handayani.png"
              alt="Logo Tut Wuri Handayani"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>
      )}

      {/* Judul Surat & Nomor */}
      <div className="text-center pt-1 pb-0.5 space-y-0.5">
        <h2 className="text-[13pt] font-black underline uppercase tracking-wide">
          SURAT KETERANGAN LULUS
        </h2>
        <p className="text-[11pt] font-bold text-black">
          Nomor: {nomorSurat}
        </p>
      </div>

      {/* Narasi Pembuka */}
      <p className="text-[11pt] text-justify leading-relaxed">
        Yang bertanda tangan di bawah ini, Kepala Sekolah Dasar Negeri Babelan Kota 01, Kecamatan Babelan, Kabupaten Bekasi, Provinsi Jawa Barat, menerangkan dengan sebenarnya bahwa:
      </p>

      {/* Identitas Siswa */}
      <div className="pl-6 space-y-1 text-[11pt] py-0.5">
        <div className="grid grid-cols-12">
          <span className="col-span-4 font-semibold">Nama Lengkap</span>
          <span className="col-span-8 font-bold uppercase text-black">: {student.nama}</span>
        </div>
        <div className="grid grid-cols-12">
          <span className="col-span-4 font-semibold">Tempat, Tanggal Lahir</span>
          <span className="col-span-8">: {student.tempat_lahir || 'Bekasi'}, {student.tanggal_lahir}</span>
        </div>
        <div className="grid grid-cols-12">
          <span className="col-span-4 font-semibold">Nomor Induk Siswa (NIS)</span>
          <span className="col-span-8">: {student.nis}</span>
        </div>
        <div className="grid grid-cols-12">
          <span className="col-span-4 font-semibold">Nomor Induk Siswa Nasional (NISN)</span>
          <span className="col-span-8 font-bold">: {student.nisn}</span>
        </div>
        <div className="grid grid-cols-12">
          <span className="col-span-4 font-semibold">Nama Orang Tua / Wali</span>
          <span className="col-span-8">: {student.orang_tua || '-'}</span>
        </div>
        <div className="grid grid-cols-12">
          <span className="col-span-4 font-semibold">Sekolah Asal</span>
          <span className="col-span-8">: {settings.nama_sekolah}</span>
        </div>
      </div>

      {/* Kalimat Pernyataan Kelulusan */}
      <div className="text-[11pt] space-y-1 text-justify leading-relaxed">
        <p>
          Berdasarkan kriteria kelulusan peserta didik yang ditetapkan oleh Satuan Pendidikan serta hasil Rapat Pleno Dewan Guru {settings.nama_sekolah} pada tanggal {tanggalRapat}, yang bersangkutan dinyatakan:
        </p>

        {/* Pernyataan Kelulusan Polos */}
        <div className="text-center py-1 my-0.5">
          <span className="text-[15pt] font-black tracking-widest text-black uppercase">
            L U L U S
          </span>
        </div>

        <p>
          Dengan daftar perolehan Nilai Rapor (Semester 1 Kelas 4 s.d. Semester 2 Kelas 6 dengan bobot {bobotRapor}%), Nilai Ujian Sekolah (bobot {bobotUS}%), dan Nilai Ijazah sebagai berikut:
        </p>
      </div>

      {/* Tabel Nilai SKL */}
      <div className="overflow-x-auto my-1">
        <table className="w-full text-left text-[10.5pt] border-collapse border border-black">
          <thead>
            <tr className="bg-white text-black font-bold border-b border-black text-center">
              <th className="border border-black py-1 px-1.5 w-8">No</th>
              <th className="border border-black py-1 px-1.5 text-left">Muatan Mata Pelajaran</th>
              <th className="border border-black py-1 px-1.5 w-24 text-center">Nilai Rapor ({bobotRapor}%)</th>
              <th className="border border-black py-1 px-1.5 w-24 text-center">Nilai US ({bobotUS}%)</th>
              <th className="border border-black py-1 px-1.5 w-24 text-center font-black">Nilai Ijazah</th>
            </tr>
          </thead>
          <tbody>
            {activeSubjects.map((subj, idx) => {
              const sc = rekapRow?.subjectScores?.[subj.id];
              return (
                <tr key={subj.id} className="bg-white">
                  <td className="border border-black py-0.5 px-1 text-center">{idx + 1}</td>
                  <td className="border border-black py-0.5 px-1.5 font-medium">{subj.nama_mapel}</td>
                  <td className="border border-black py-0.5 px-1 text-center font-medium">
                    {formatBulat(sc?.rapor)}
                  </td>
                  <td className="border border-black py-0.5 px-1 text-center font-medium">
                    {formatBulat(sc?.usAkhir)}
                  </td>
                  <td className="border border-black py-0.5 px-1 text-center font-bold">
                    {formatDuaDesimal(sc?.nilaiIjazah)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-white font-bold border-t-2 border-black text-center">
              <td colSpan={4} className="border border-black py-1 px-1.5 text-right font-bold uppercase text-[10pt]">
                Jumlah Nilai Ijazah
              </td>
              <td className="border border-black py-1 px-1.5 text-center font-bold text-black text-[10.5pt]">
                {formatDuaDesimal(rekapRow?.totalIjazah)}
              </td>
            </tr>
            <tr className="bg-white font-bold border-t border-black text-center">
              <td colSpan={4} className="border border-black py-1 px-1.5 text-right font-black uppercase text-[10pt]">
                Rata-rata Nilai Ijazah
              </td>
              <td className="border border-black py-1 px-1.5 text-center font-black text-black text-[11pt]">
                {formatDuaDesimal(rekapRow?.rataIjazah)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Keterangan Penutup */}
      <p className="text-[10pt] text-justify text-slate-700 italic leading-snug">
        Surat Keterangan Lulus ini bersifat resmi dan berlaku sementara sebagai pengganti blangko Ijazah resmi sampai dengan Ijazah asli diterbitkan oleh Dinas Pendidikan, untuk keperluan pendaftaran ke jenjang pendidikan selanjutnya (SMP/MTs/Sederajat).
      </p>

      {/* Tanda Tangan dan Stempel Resmi */}
      <div className="pt-2 grid grid-cols-2 gap-8 text-[11pt] avoid-page-break items-end">
        {/* Kotak Pas Foto 3x4 */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-22 h-28 border border-dashed border-slate-400 bg-white flex flex-col items-center justify-center text-center p-1 text-slate-400 text-[9pt]">
            <span>Pas Foto Siswa</span>
            <span className="font-bold mt-0.5">3 x 4 cm</span>
            <span className="text-[8pt] mt-0.5">(Cap Tiga Jari)</span>
          </div>
        </div>

        {/* Pengesahan Kepala Sekolah */}
        <div className="text-center space-y-0.5">
          <p>{kota}, {tanggalLulus}</p>
          <p className="font-bold">Kepala Sekolah,</p>
          <div className="h-14 relative flex items-center justify-center">
            <span className="text-[9pt] text-slate-300 font-sans border border-dashed border-slate-300 rounded-full px-4 py-2">
              [ Cap / Stempel Sekolah ]
            </span>
          </div>
          <p className="font-bold underline uppercase text-black">
            {settings.nama_kepsek || 'Lailatul Fajriah, S.Pd.SD'}
          </p>
          <p className="text-[10pt] text-black">
            NIP. {settings.nip_kepsek || '197808202008012005'}
          </p>
        </div>
      </div>

      {/* Footer Dokumen SKL: nisn_nama siswa */}
      <div className="skl-doc-footer pt-2 mt-2 border-t border-slate-300 flex items-center justify-between text-[10pt] text-slate-600">
        <span className="font-bold">
          {student.nisn ? `${student.nisn}_${student.nama}` : student.nama || 'nisn_nama siswa'}
        </span>
        <span className="text-[9pt] text-slate-500 uppercase tracking-wider">
          Dokumen Resmi Kelulusan • {settings.nama_sekolah}
        </span>
      </div>
    </div>
  );
};
