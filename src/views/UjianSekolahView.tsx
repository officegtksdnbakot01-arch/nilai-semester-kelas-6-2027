import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SchoolExam } from '../types';
import {
  Award,
  Download,
  Printer,
  Search,
  CheckCircle,
  Save,
  Trophy,
  Sliders,
  Filter,
} from 'lucide-react';
import { ExcelService } from '../services/excel';
import { PrintService } from '../services/printService';

export const UjianSekolahView: React.FC = () => {
  const { currentUser, isAdmin, canAccessRombel } = useAuth();
  const { students, subjects, schoolExams, settings, rombels, saveSchoolExam, addToast } = useApp();

  // Filters
  const defaultRombel = !isAdmin && currentUser?.rombel ? currentUser.rombel : '6A';
  const [selectedRombel, setSelectedRombel] = useState<string>(defaultRombel);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'rekap-rank' | 'input-nilai'>('rekap-rank');
  const [inputSubjectId, setInputSubjectId] = useState<string>(subjects[0]?.id || '');

  // Local state for interactive US input table
  interface ExamRowState {
    studentId: string;
    nisn: string;
    nama: string;
    praktikRaw: string;
    tulisRaw: string;
    nilaiAkhirRaw: string;
    isDirty: boolean;
  }

  const [inputRows, setInputRows] = useState<ExamRowState[]>([]);

  // Only Class 6 students
  const class6Students = useMemo(() => {
    let list = students.filter((s) => s.kelas === '6');
    if (selectedRombel !== 'ALL') {
      list = list.filter((s) => s.rombel === selectedRombel);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.nama.toLowerCase().includes(q) || s.nisn.includes(q));
    }
    return list;
  }, [students, selectedRombel, searchQuery]);

  // Ranking & Summary calculation
  const rankedStudents = useMemo(() => {
    const activeSubjects = subjects.filter((s) => s.aktif);

    const mapped = class6Students.map((s) => {
      const studentExams = schoolExams.filter((e) => e.student_id === s.id && e.nilai !== null);
      const totalScore = studentExams.reduce((sum, e) => sum + (e.nilai || 0), 0);
      const average = studentExams.length > 0 ? Number((totalScore / studentExams.length).toFixed(1)) : 0;
      const isLulus = average >= settings.kktp_default;

      return {
        student: s,
        exams: studentExams,
        totalScore,
        average,
        isLulus,
      };
    });

    // Sort descending by average
    mapped.sort((a, b) => b.average - a.average);

    return mapped.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [class6Students, schoolExams, subjects, settings.kktp_default]);

  // Load input rows when inputSubjectId or rombel changes
  React.useEffect(() => {
    const rows: ExamRowState[] = class6Students.map((s) => {
      const exam = schoolExams.find((e) => e.student_id === s.id && e.subject_id === inputSubjectId);
      return {
        studentId: s.id,
        nisn: s.nisn,
        nama: s.nama,
        praktikRaw: exam?.nilai_praktik !== null && exam?.nilai_praktik !== undefined ? String(exam.nilai_praktik) : '',
        tulisRaw: exam?.nilai_tulis !== null && exam?.nilai_tulis !== undefined ? String(exam.nilai_tulis) : '',
        nilaiAkhirRaw: exam?.nilai !== null && exam?.nilai !== undefined ? String(exam.nilai) : '',
        isDirty: false,
      };
    });
    setInputRows(rows);
  }, [class6Students, inputSubjectId, schoolExams]);

  const handleInputChange = (
    studentId: string,
    field: 'praktik' | 'tulis' | 'nilaiAkhir',
    val: string
  ) => {
    setInputRows((prev) =>
      prev.map((row) => {
        if (row.studentId !== studentId) return row;

        const updated = { ...row, isDirty: true };
        if (field === 'praktik') updated.praktikRaw = val;
        if (field === 'tulis') updated.tulisRaw = val;
        if (field === 'nilaiAkhir') updated.nilaiAkhirRaw = val;

        // Auto-calculate akhir if praktik and tulis are filled
        if (field !== 'nilaiAkhir') {
          const p = Number(updated.praktikRaw);
          const t = Number(updated.tulisRaw);
          if (!isNaN(p) && !isNaN(t) && updated.praktikRaw !== '' && updated.tulisRaw !== '') {
            updated.nilaiAkhirRaw = String(Math.round(p * 0.4 + t * 0.6));
          }
        }

        return updated;
      })
    );
  };

  const handleSaveExamInput = () => {
    inputRows.forEach((row) => {
      const p = row.praktikRaw !== '' && !isNaN(Number(row.praktikRaw)) ? Number(row.praktikRaw) : null;
      const t = row.tulisRaw !== '' && !isNaN(Number(row.tulisRaw)) ? Number(row.tulisRaw) : null;
      const akhir = row.nilaiAkhirRaw !== '' && !isNaN(Number(row.nilaiAkhirRaw)) ? Number(row.nilaiAkhirRaw) : null;

      saveSchoolExam(row.studentId, inputSubjectId, p, t, akhir);
    });

    addToast('success', 'Nilai Ujian Sekolah berhasil disimpan.');
    setInputRows((prev) => prev.map((r) => ({ ...r, isDirty: false })));
  };

  const handleExportExcel = () => {
    ExcelService.exportSchoolExam(students, subjects, schoolExams, settings, selectedRombel);
  };

  const handlePrint = () => {
    PrintService.triggerPrint({
      orientation: 'landscape',
      title: `Rekap_Hasil_US_Kelas6_${selectedRombel}`,
    });
  };

  const activeSubjects = subjects.filter((s) => s.aktif);
  const hasAccess = canAccessRombel(selectedRombel);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200/70 mb-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Kelulusan & Peringkat Kelas 6</span>
            <span className="text-[10px] bg-amber-200/60 px-1.5 py-0.2 rounded-sm font-bold">
              T.A. {settings.tahun_ajaran}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Ujian Sekolah (US) Kelas 6
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penilaian akhir jenjang pendidikan Sekolah Dasar SDN BABELAN KOTA 01 (Standar A4 Landscape).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export US Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
            title="Cetak format A4 Landscape atau Simpan sebagai PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh PDF (A4 Landscape)</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 no-print">
        <button
          onClick={() => setActiveTab('rekap-rank')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'rekap-rank'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Rekap & Peringkat Ujian</span>
        </button>

        <button
          onClick={() => setActiveTab('input-nilai')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'input-nilai'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Input Nilai Ujian Per Mapel</span>
        </button>
      </div>

      {/* Rombel & Search filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between no-print">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau NISN..."
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-md outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-600">Rombel Kelas 6:</span>
          <select
            disabled={!isAdmin && Boolean(currentUser?.rombel)}
            value={selectedRombel}
            onChange={(e) => setSelectedRombel(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-300 rounded-md px-3 py-1.5 outline-hidden text-slate-800 disabled:bg-slate-100 cursor-pointer"
          >
            {isAdmin && <option value="ALL">Semua Rombel (6A, 6B, 6C, 6D)</option>}
            <option value="6A">Rombel 6A</option>
            <option value="6B">Rombel 6B</option>
            <option value="6C">Rombel 6C</option>
            <option value="6D">Rombel 6D</option>
          </select>
        </div>
      </div>

      {/* Official Print Kop */}
      <div className="hidden print:flex items-center gap-4 border-b-2 border-black pb-3 mb-4 font-serif">
        <img
          src={settings.logo_url || "https://i.ibb.co.com/rRhHc2PD/logo-bakot-01.png"}
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
            DAFTAR HASIL UJIAN SEKOLAH (US) & PERINGKAT KELAS 6 • ROMBEL {selectedRombel} • T.A. {settings.tahun_ajaran}
          </p>
        </div>
      </div>

      {/* TAB 1: REKAP & PERINGKAT */}
      {activeTab === 'rekap-rank' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden printable-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-center">
                  <th className="px-3 py-3 w-16 text-center">Peringkat</th>
                  <th className="px-3 py-3 w-28 text-left">NISN</th>
                  <th className="px-4 py-3 min-w-[180px] text-left">Nama Siswa</th>
                  <th className="px-3 py-3 w-16 text-center">Rombel</th>
                  {activeSubjects.map((s) => (
                    <th key={s.id} className="px-2 py-3 text-center border-l border-slate-200">
                      {s.kode}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center border-l border-slate-200 bg-slate-200/60 text-slate-900 font-black">
                    Total
                  </th>
                  <th className="px-3 py-3 text-center bg-amber-100 text-amber-950 font-black">
                    Rata2 US
                  </th>
                  <th className="px-3 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6 + activeSubjects.length} className="px-4 py-12 text-center text-slate-400">
                      Tidak ada data siswa untuk kriteria ini.
                    </td>
                  </tr>
                ) : (
                  rankedStudents.map((item) => {
                    const isTop3 = item.rank <= 3;
                    return (
                      <tr key={item.student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                              item.rank === 1
                                ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                                : item.rank === 2
                                ? 'bg-slate-300 text-slate-900'
                                : item.rank === 3
                                ? 'bg-amber-700 text-amber-50'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.rank}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono font-semibold text-slate-700">
                          {item.student.nisn}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-900">
                          {item.student.nama}
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold text-slate-600">
                          {item.student.rombel}
                        </td>

                        {/* Subject Scores */}
                        {activeSubjects.map((s) => {
                          const exam = item.exams.find((e) => e.subject_id === s.id);
                          return (
                            <td key={s.id} className="px-2 py-2.5 text-center border-l border-slate-100 font-medium">
                              {exam?.nilai ?? '-'}
                            </td>
                          );
                        })}

                        {/* Total Score */}
                        <td className="px-3 py-2.5 text-center border-l border-slate-200 bg-slate-50 font-bold text-slate-800">
                          {item.totalScore}
                        </td>

                        {/* Average */}
                        <td className="px-3 py-2.5 text-center bg-amber-50/60 font-black text-amber-900 text-xs">
                          {item.average}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.isLulus
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <CheckCircle className="w-3 h-3" />
                            {item.isLulus ? 'LULUS' : 'REMEDIAL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Tanda Tangan Resmi (Hanya tampil saat dicetak) */}
          <div className="hidden print:grid grid-cols-2 gap-8 mt-8 p-4 text-xs text-center font-serif">
            <div>
              <p>Mengetahui,</p>
              <p>Kepala {settings.nama_sekolah}</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{settings.nama_kepsek || '....................................'}</p>
              <p>NIP. {settings.nip_kepsek || '-'}</p>
            </div>
            <div>
              <p>{settings.kecamatan || 'Bekasi'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p>Ketua Panitia Ujian Sekolah / Guru Kelas 6</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{currentUser?.nama || '....................................'}</p>
              <p>NIP. {currentUser?.nip || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INPUT NILAI PER MAPEL */}
      {activeTab === 'input-nilai' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-700">Mata Pelajaran Ujian:</span>
              <select
                value={inputSubjectId}
                onChange={(e) => setInputSubjectId(e.target.value)}
                className="text-xs font-bold bg-white border border-slate-300 rounded-md px-3 py-1.5 outline-hidden text-slate-800 cursor-pointer"
              >
                {activeSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama_mapel} ({s.kode})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSaveExamInput}
              disabled={!hasAccess}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Nilai Ujian Ini</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                    <th className="px-4 py-3 w-12 text-center">No</th>
                    <th className="px-4 py-3 w-32">NISN</th>
                    <th className="px-4 py-3 min-w-[200px]">Nama Siswa</th>
                    <th className="px-4 py-3 w-32 text-center bg-blue-50/50 text-blue-900">
                      Nilai Praktik US
                    </th>
                    <th className="px-4 py-3 w-32 text-center bg-indigo-50/50 text-indigo-900">
                      Nilai Tulis US
                    </th>
                    <th className="px-4 py-3 w-36 text-center bg-amber-100 text-amber-950 font-black">
                      Nilai Akhir US (40:60)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inputRows.map((row, idx) => (
                    <tr key={row.studentId} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">{row.nisn}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{row.nama}</td>
                      <td className="px-4 py-2 text-center bg-blue-50/20">
                        <input
                          type="number"
                          disabled={!hasAccess}
                          value={row.praktikRaw}
                          onChange={(e) => handleInputChange(row.studentId, 'praktik', e.target.value)}
                          placeholder="-"
                          className="w-20 text-center font-bold px-2 py-1.5 rounded-lg border border-slate-200 text-xs outline-hidden focus:border-blue-500 bg-white"
                        />
                      </td>
                      <td className="px-4 py-2 text-center bg-indigo-50/20">
                        <input
                          type="number"
                          disabled={!hasAccess}
                          value={row.tulisRaw}
                          onChange={(e) => handleInputChange(row.studentId, 'tulis', e.target.value)}
                          placeholder="-"
                          className="w-20 text-center font-bold px-2 py-1.5 rounded-lg border border-slate-200 text-xs outline-hidden focus:border-blue-500 bg-white"
                        />
                      </td>
                      <td className="px-4 py-2 text-center bg-amber-50/40">
                        <input
                          type="number"
                          disabled={!hasAccess}
                          value={row.nilaiAkhirRaw}
                          onChange={(e) => handleInputChange(row.studentId, 'nilaiAkhir', e.target.value)}
                          placeholder="-"
                          className="w-24 text-center font-black px-2 py-1.5 rounded-lg border border-amber-300 text-sm outline-hidden focus:border-amber-600 bg-amber-50"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
