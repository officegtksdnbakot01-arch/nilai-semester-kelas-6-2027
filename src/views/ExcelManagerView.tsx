import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SemesterCode, Student } from '../types';
import { ExcelService, ImportResult } from '../services/excel';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  RefreshCw,
  FolderDown,
  Layers,
  Award,
  Users,
} from 'lucide-react';

export const ExcelManagerView: React.FC = () => {
  const { currentUser, isAdmin, canAccessRombel } = useAuth();
  const {
    students,
    subjects,
    grades,
    schoolExams,
    settings,
    rombels,
    importStudents,
    importGrades,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'template'>('import');
  const [importType, setImportType] = useState<'students' | 'grades'>('students');

  // Import options
  const [skipDuplicates, setSkipDuplicates] = useState(false);
  const [gradeSemester, setGradeSemester] = useState<SemesterCode>(settings.semester_aktif);
  const [gradeSubjectId, setGradeSubjectId] = useState<string>(subjects[0]?.id || '');
  const [gradeKelas, setGradeKelas] = useState<'4' | '5' | '6'>('6');
  const [gradeRombel, setGradeRombel] = useState<string>(
    currentUser?.rombel || '6A'
  );

  // File states
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export options
  const [exportRombel, setExportRombel] = useState<string>(
    isAdmin ? 'ALL' : currentUser?.rombel || '6A'
  );
  const [exportSubjectId, setExportSubjectId] = useState<string>(subjects[0]?.id || '');

  // Template options
  const [templateSubjectId, setTemplateSubjectId] = useState<string>(subjects[0]?.id || '');
  const [templateRombel, setTemplateRombel] = useState<string>(currentUser?.rombel || '6A');
  const [templateSemester, setTemplateSemester] = useState<SemesterCode>(settings.semester_aktif);
  const [templateIncludeStudents, setTemplateIncludeStudents] = useState<boolean>(false);

  // File Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      addToast('error', 'Format file tidak didukung. Harap unggah file spreadsheet Excel (.xlsx atau .xls).');
      return;
    }
    setSelectedFile(file);
    setImportResult(null);
  };

  // Run Import
  const handleExecuteImport = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      if (importType === 'students') {
        const result = await ExcelService.parseStudentExcel(selectedFile, students);
        if (result.success && result.data.length > 0) {
          importStudents(result.data, skipDuplicates);
        }
        setImportResult(result);
        if (result.success) {
          addToast('success', `Berhasil memproses import ${result.data.length} peserta didik.`);
        } else {
          addToast('error', 'Gagal memproses file import. Periksa log kesalahan.');
        }
      } else {
        // Grade Import
        const result = await ExcelService.parseGradeExcel(
          selectedFile,
          students,
          subjects,
          gradeSemester,
          gradeKelas,
          gradeRombel
        );
        if (result.success && result.data.length > 0) {
          importGrades(result.data);
        }
        setImportResult(result);
        if (result.success) {
          addToast('success', `Berhasil mengimport nilai untuk ${result.data.length} baris nilai.`);
        } else {
          addToast('error', 'Gagal memproses nilai. Periksa catatan kesalahan.');
        }
      }
    } catch (err: any) {
      addToast('error', err.message || 'Terjadi kesalahan sistem saat membaca file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 mb-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Integrasi & Kompatibilitas Excel</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Pusat Integrasi & Template Excel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah dan unduh data peserta didik, nilai rapor semester, serta nilai ujian sekolah dengan format resmi.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
          <button
            onClick={() => {
              setActiveTab('import');
              setImportResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Data</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>

          <button
            onClick={() => setActiveTab('template')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'template'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderDown className="w-3.5 h-3.5" />
            <span>Unduh Template</span>
          </button>
        </div>
      </div>

      {/* TAB 1: IMPORT DATA */}
      {activeTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: configurations */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Pengaturan Import
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jenis Data yang Diimpor
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setImportType('students');
                    setSelectedFile(null);
                    setImportResult(null);
                  }}
                  className={`p-2.5 rounded-md border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    importType === 'students'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Data Siswa</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImportType('grades');
                    setSelectedFile(null);
                    setImportResult(null);
                  }}
                  className={`p-2.5 rounded-md border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    importType === 'grades'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Nilai Rapor</span>
                </button>
              </div>
            </div>

            {importType === 'students' ? (
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    id="skip-dup"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-md"
                  />
                  <label htmlFor="skip-dup" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Abaikan (Skip) jika NISN sudah terdaftar di sistem. Jika tidak dicentang, data lama akan diperbarui.
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Semester Tujuan
                  </label>
                  <select
                    value={gradeSemester}
                    onChange={(e) => setGradeSemester(e.target.value as SemesterCode)}
                    className="w-full text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-md outline-hidden focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Smt1_Kls4">Semester 1 - Kelas 4 (Fase B)</option>
                    <option value="Smt2_Kls4">Semester 2 - Kelas 4 (Fase B)</option>
                    <option value="Smt1_Kls5">Semester 1 - Kelas 5 (Fase C)</option>
                    <option value="Smt2_Kls5">Semester 2 - Kelas 5 (Fase C)</option>
                    <option value="Smt1_Kls6">Semester 1 - Kelas 6 (Fase C)</option>
                    <option value="Smt2_Kls6">Semester 2 - Kelas 6 (Fase C)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <select
                    value={gradeSubjectId}
                    onChange={(e) => setGradeSubjectId(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-md outline-hidden focus:border-blue-500 cursor-pointer"
                  >
                    {subjects.filter((s) => s.aktif).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama_mapel} ({s.kode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rombel
                  </label>
                  <select
                    disabled={!isAdmin && Boolean(currentUser?.rombel)}
                    value={gradeRombel}
                    onChange={(e) => {
                      setGradeRombel(e.target.value);
                      const k = (e.target.value.charAt(0) as '4' | '5' | '6') || '6';
                      setGradeKelas(k);
                    }}
                    className="w-full text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-md outline-hidden focus:border-blue-500 cursor-pointer disabled:bg-slate-100"
                  >
                    {rombels.map((r) => (
                      <option key={r.id} value={r.nama}>
                        Rombel {r.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (importType === 'students') {
                    ExcelService.downloadStudentTemplate();
                  } else {
                    ExcelService.downloadGradeTemplate();
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Format Template {importType === 'students' ? 'Siswa' : 'Nilai'}</span>
              </button>
            </div>
          </div>

          {/* Right panel: Drag & Drop + Process */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-8 border-2 border-dashed rounded-xl text-center flex flex-col items-center justify-center transition-all min-h-[220px] ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-7 h-7" />
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 block font-mono">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Siap diproses
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-blue-600 hover:underline font-bold mt-2 inline-block cursor-pointer"
                  >
                    Ganti File
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-800">
                    Tarik dan lepaskan file Excel di sini
                  </p>
                  <p className="text-xs text-slate-400">
                    Mendukung file berekstensi Microsoft Excel .xlsx atau .xls
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                  >
                    <FolderDown className="w-3.5 h-3.5" />
                    <span>Pilih File Dari Komputer</span>
                  </button>
                </div>
              )}
            </div>

            {selectedFile && (
              <button
                disabled={isProcessing}
                onClick={handleExecuteImport}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses Data Excel...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mulai Impor Data Sekarang</span>
                  </>
                )}
              </button>
            )}

            {/* Import Result Box */}
            {importResult && (
              <div
                className={`p-5 rounded-3xl border ${
                  importResult.success
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/70 border-rose-200 text-rose-900'
                } space-y-3`}
              >
                <div className="flex items-center gap-2 font-black text-sm">
                  {importResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>
                    {importResult.success
                      ? `Sukses! Berhasil membaca ${importResult.data.length} baris data.`
                      : 'Terjadi Kesalahan Saat Mengimpor File'}
                  </span>
                </div>

                {importResult.warnings.length > 0 && (
                  <div className="text-xs space-y-1 bg-white/70 p-3 rounded-xl border border-emerald-200/50">
                    <p className="font-bold text-amber-800">Catatan & Peringatan:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-amber-700">
                      {importResult.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {importResult.errors.length > 0 && (
                  <div className="text-xs space-y-1 bg-white/70 p-3 rounded-xl border border-rose-200/50">
                    <p className="font-bold text-rose-800">Daftar Error Validasi:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-rose-700">
                      {importResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EXPORT DATA */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Export Card 1: Data Siswa */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">
                Export Data Peserta Didik
              </h3>
              <p className="text-xs text-slate-500">
                Unduh seluruh biodata siswa lengkap dengan NISN, NIS, tempat/tanggal lahir, orang tua, dan rombel.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Pilih Rombel
                </label>
                <select
                  value={exportRombel}
                  onChange={(e) => setExportRombel(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-md outline-hidden cursor-pointer"
                >
                  <option value="ALL">Semua Siswa Aktif ({students.length})</option>
                  {rombels.map((r) => (
                    <option key={r.id} value={r.nama}>
                      Rombel {r.nama}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  const list = exportRombel === 'ALL' ? students : students.filter((s) => s.rombel === exportRombel);
                  ExcelService.exportStudents(list, settings, exportRombel);
                  addToast('success', 'File Excel siswa berhasil diunduh.');
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Excel Siswa</span>
              </button>
            </div>
          </div>

          {/* Export Card 2: Rekap Nilai Rapor */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">
                Export Rekap Nilai Rapor
              </h3>
              <p className="text-xs text-slate-500">
                Unduh matriks nilai multi-semester (Semester 1 & 2 Kelas 4, 5, 6) per mata pelajaran atau per rombel.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Mata Pelajaran
                </label>
                <select
                  value={exportSubjectId}
                  onChange={(e) => setExportSubjectId(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-md outline-hidden cursor-pointer"
                >
                  {subjects.filter((s) => s.aktif).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama_mapel} ({s.kode})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  const targetRombel = exportRombel === 'ALL' ? (currentUser?.rombel || '6A') : exportRombel;
                  ExcelService.exportGradeRecap(students, subjects, grades, settings, targetRombel, exportSubjectId);
                  addToast('success', 'Rekap nilai berhasil diunduh.');
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Rekap Nilai</span>
              </button>
            </div>
          </div>

          {/* Export Card 3: Ujian Sekolah */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">
                Export Nilai Ujian Sekolah
              </h3>
              <p className="text-xs text-slate-500">
                Unduh daftar nilai kelulusan Ujian Sekolah (US) kelas 6 lengkap dengan ranking dan rata-rata akhir.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  ExcelService.exportSchoolExam(students, subjects, schoolExams, settings, 'ALL');
                  addToast('success', 'Rekap Ujian Sekolah berhasil diunduh.');
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Rekap US Kelas 6</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOWNLOAD TEMPLATE */}
      {activeTab === 'template' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
                <FolderDown className="w-3.5 h-3.5" />
                <span>Format Resmi Kurikulum Merdeka</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-800">
                Format Master Template Excel (Border & Warna)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Seluruh template telah disesuaikan dengan standar SDN BABELAN KOTA 01. Data sampel bawaan dikosongkan, seluruh sel tabel diberi border/garis rapi, diberi aksen warna header, dan penamaan template nilai semester menggunakan nama mata pelajaran masing-masing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Template Data Peserta Didik */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Data Bawaan Dikosongkan
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    Template Data Peserta Didik (.xlsx)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Template kosong bergaris untuk memasukkan data biodata siswa baru atau pembaruan massal. Siap diisi tanpa perlu menghapus data contoh bawaan.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Struktur Format Kolom:
                  </p>
                  <p className="text-[11px] text-slate-500 pl-5">
                    No, NIS, NISN, Nama Siswa, L/P, Tempat Lahir, Tanggal Lahir (YYYY-MM-DD), Nama Orang Tua, Kelas, Rombel (6A/6B/6C/6D).
                  </p>
                  <p className="text-[11px] text-slate-500 pl-5">
                    Dilengkapi header Biru Tua (#1E3A8A) dan garis border tipis di seluruh baris tabel.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  ExcelService.downloadStudentTemplate();
                  addToast('success', 'Template Data Siswa (kosong & bergaris) berhasil diunduh.');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Template Data Siswa (Kosong)</span>
              </button>
            </div>

            {/* Card 2: Template Nilai Semester Per Mata Pelajaran */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Sesuai Mapel Masing-Masing
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    Template Nilai Semester Per Mata Pelajaran
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Nama file dan nama sheet otomatis disesuaikan dengan mata pelajaran yang dipilih. Garis border rapi, header hijau zamrud, dan kolom nilai diwarnai agar mudah diisi.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Pilih Semester
                    </label>
                    <select
                      value={templateSemester}
                      onChange={(e) => setTemplateSemester(e.target.value as SemesterCode)}
                      className="w-full text-xs font-semibold px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Smt1_Kls4">Smt 1 - Kelas 4</option>
                      <option value="Smt2_Kls4">Smt 2 - Kelas 4</option>
                      <option value="Smt1_Kls5">Smt 1 - Kelas 5</option>
                      <option value="Smt2_Kls5">Smt 2 - Kelas 5</option>
                      <option value="Smt1_Kls6">Smt 1 - Kelas 6</option>
                      <option value="Smt2_Kls6">Smt 2 - Kelas 6</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Target Rombel
                    </label>
                    <select
                      value={templateRombel}
                      onChange={(e) => setTemplateRombel(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:border-emerald-500 cursor-pointer"
                    >
                      {rombels.map((r) => (
                        <option key={r.id} value={r.nama}>
                          Rombel {r.nama} (Kelas {r.kelas})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Mata Pelajaran Spesifik
                    </label>
                    <select
                      value={templateSubjectId}
                      onChange={(e) => setTemplateSubjectId(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:border-emerald-500 cursor-pointer"
                    >
                      {subjects.filter((s) => s.aktif).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama_mapel} ({s.kode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="includeStudentsCheckbox"
                    checked={templateIncludeStudents}
                    onChange={(e) => setTemplateIncludeStudents(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="includeStudentsCheckbox" className="text-xs text-slate-700 select-none cursor-pointer">
                    Sertakan nama & NISN siswa terdaftar di Rombel {templateRombel} (nilai tetap kosong)
                  </label>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {/* Primary: Format Gabungan Seluruh Mapel dalam 1 File */}
                <button
                  onClick={() => {
                    ExcelService.downloadGradeTemplate({
                      semester: templateSemester,
                      rombel: templateRombel,
                      subjects,
                      students,
                      includeStudents: templateIncludeStudents,
                    });
                    addToast('success', `Format Excel Gabungan Semua Mapel (${templateSemester}) berhasil diunduh.`);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    Unduh Format Excel Nilai Rapor (Semua Mapel Digabung - {templateSemester})
                  </span>
                </button>

                {/* Paket 6 Semester */}
                <button
                  onClick={() => {
                    ExcelService.downloadAllSemestersGradePackage({
                      rombel: templateRombel,
                      subjects,
                      students,
                      includeStudents: templateIncludeStudents,
                    });
                    addToast('success', 'Paket Nilai Rapor Lengkap 6 Semester (Semester 1 - Kelas 4 s.d. Semester 2 - Kelas 6) berhasil diunduh.');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  <FolderDown className="w-3.5 h-3.5 text-purple-600" />
                  <span>Unduh Paket Semua Semester (6 Sheet: Smt 1 Kls 4 s.d. Smt 2 Kls 6)</span>
                </button>

                {/* Single Subject Template */}
                <button
                  onClick={() => {
                    const chosenSubject = subjects.find((s) => s.id === templateSubjectId) || subjects[0];
                    ExcelService.downloadGradeTemplate({
                      subject: chosenSubject,
                      semester: templateSemester,
                      rombel: templateRombel,
                      students,
                      includeStudents: templateIncludeStudents,
                    });
                    addToast('success', `Template Nilai ${chosenSubject.nama_mapel} berhasil diunduh.`);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                  <span>Format Khusus 1 Mapel: {subjects.find((s) => s.id === templateSubjectId)?.nama_mapel || 'Mapel'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
