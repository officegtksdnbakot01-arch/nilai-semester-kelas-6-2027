import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Users,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Award,
  ArrowRight,
  TrendingUp,
  School,
  Printer,
  Calendar,
  Layers,
} from 'lucide-react';
import { ActiveTab } from '../components/layout/Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { currentUser, isAdmin } = useAuth();
  const { students, subjects, grades, settings } = useApp();

  // Selected rombel filter for admin; for teacher, locked to assigned rombel
  const [selectedRombel, setSelectedRombel] = useState<string>(
    currentUser?.rombel || '6A'
  );
  const [previewSearch, setPreviewSearch] = useState('');
  const [previewSubjectId, setPreviewSubjectId] = useState<string>('ALL');

  const activeRombel = isAdmin ? selectedRombel : currentUser?.rombel || '6A';

  // Compute metrics for active rombel
  const metrics = useMemo(() => {
    let targetStudents = students;
    if (activeRombel !== 'ALL') {
      targetStudents = students.filter((s) => s.rombel === activeRombel);
    }

    const totalStudents = targetStudents.length;
    const totalMale = targetStudents.filter((s) => s.jenis_kelamin === 'L').length;
    const totalFemale = targetStudents.filter((s) => s.jenis_kelamin === 'P').length;
    const activeSubjects = subjects.filter((s) => s.aktif);
    const totalSubjects = activeSubjects.length;

    // Check completion in the current semester (settings.semester_aktif)
    let completeStudents = 0;
    let incompleteStudents = 0;

    targetStudents.forEach((std) => {
      const studentGrades = grades.filter(
        (g) => g.student_id === std.id && g.semester === settings.semester_aktif && g.nilai_akhir !== null
      );
      if (studentGrades.length >= totalSubjects && totalSubjects > 0) {
        completeStudents++;
      } else {
        incompleteStudents++;
      }
    });

    // Per-subject completion in active rombel
    const subjectProgress = activeSubjects.map((subj) => {
      let filledCount = 0;
      targetStudents.forEach((std) => {
        const found = grades.find(
          (g) =>
            g.student_id === std.id &&
            g.subject_id === subj.id &&
            g.semester === settings.semester_aktif &&
            g.nilai_akhir !== null
        );
        if (found) filledCount++;
      });
      const pct = totalStudents > 0 ? Math.round((filledCount / totalStudents) * 100) : 0;
      return {
        subject: subj,
        filledCount,
        total: totalStudents,
        pct,
      };
    });

    return {
      totalStudents,
      totalMale,
      totalFemale,
      totalSubjects,
      completeStudents,
      incompleteStudents,
      subjectProgress,
    };
  }, [students, subjects, grades, settings.semester_aktif, activeRombel]);

  // Target preview students
  const previewStudents = useMemo(() => {
    let list = students;
    if (activeRombel !== 'ALL') {
      list = list.filter((s) => s.rombel === activeRombel);
    }
    if (previewSearch.trim()) {
      const q = previewSearch.toLowerCase();
      list = list.filter((s) => s.nama.toLowerCase().includes(q) || s.nisn.includes(q));
    }
    return list.slice(0, 8);
  }, [students, activeRombel, previewSearch]);

  const activeSubjects = useMemo(() => subjects.filter((s) => s.aktif), [subjects]);
  const defaultSubj = activeSubjects[0];
  const targetSubjId = previewSubjectId === 'ALL' ? defaultSubj?.id : previewSubjectId;
  const targetSubject = subjects.find((s) => s.id === targetSubjId) || defaultSubj;

  return (
    <div className="space-y-6">
      {/* Bento Welcome Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60">
              <img
                src={settings.logo_url || "https://i.ibb.co.com/rRhHc2PD/logo-bakot-01.png"}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="w-4 h-4 object-contain"
              />
              <span>{settings.nama_sekolah} • T.A. {settings.tahun_ajaran}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Selamat Datang, {currentUser?.nama?.split('(')[0]?.trim()}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              {isAdmin ? (
                <span>
                  Anda masuk sebagai <strong>Administrator</strong>. Anda memiliki wewenang penuh mengelola seluruh rombel (6A, 6B, 6C, 6D), master mata pelajaran, bobot penilaian, dan cetak rapor.
                </span>
              ) : (
                <span>
                  Anda masuk sebagai Guru Kelas penanggung jawab <strong>Rombel {currentUser?.rombel}</strong>. Silakan masukkan dan verifikasi kelengkapan nilai semester serta ujian sekolah siswa Anda.
                </span>
              )}
            </p>
          </div>

          {/* Admin Rombel Filter Selector */}
          {isAdmin && (
            <div className="shrink-0 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Pilih Tampilan Rombel
              </label>
              <select
                value={selectedRombel}
                onChange={(e) => setSelectedRombel(e.target.value)}
                className="bg-white text-slate-800 font-bold text-xs rounded-md px-3 py-1.5 border border-slate-300 outline-hidden shadow-2xs cursor-pointer"
              >
                <option value="ALL">Seluruh Rombel (Semua Siswa)</option>
                <optgroup label="Kelas 6">
                  <option value="6A">Rombel 6A</option>
                  <option value="6B">Rombel 6B</option>
                  <option value="6C">Rombel 6C</option>
                  <option value="6D">Rombel 6D</option>
                </optgroup>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 4 Bento Grid Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Jumlah Siswa */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg text-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Aktif
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-semibold mt-4 uppercase tracking-wider">
            Jumlah Siswa
          </h3>
          <p className="text-3xl font-black text-slate-800 mt-1">
            {metrics.totalStudents}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
            <span>{metrics.totalMale} Laki-laki</span>
            <span>•</span>
            <span>{metrics.totalFemale} Perempuan</span>
          </div>
        </div>

        {/* Card 2: Mata Pelajaran */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-indigo-100 text-indigo-700 rounded-lg text-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Kurmer
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-semibold mt-4 uppercase tracking-wider">
            Mata Pelajaran
          </h3>
          <p className="text-3xl font-black text-slate-800 mt-1">
            {metrics.totalSubjects}
          </p>
          <div className="mt-2 text-[10px] text-slate-400 truncate">
            Pendidikan Pancasila, IPAS, dll
          </div>
        </div>

        {/* Card 3: Nilai Lengkap */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg text-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Tuntas
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-semibold mt-4 uppercase tracking-wider">
            Nilai Lengkap
          </h3>
          <p className="text-3xl font-black text-slate-800 mt-1">
            {metrics.completeStudents}
          </p>
          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{
                width: `${
                  metrics.totalStudents > 0
                    ? Math.round((metrics.completeStudents / metrics.totalStudents) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Card 4: Belum Lengkap */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-red-100 text-red-700 rounded-lg text-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </span>
            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Revisi
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-semibold mt-4 uppercase tracking-wider">
            Belum Lengkap
          </h3>
          <p className="text-3xl font-black text-slate-800 mt-1">
            {metrics.incompleteStudents.toString().padStart(2, '0')}
          </p>
          <div className="mt-2 text-[10px] text-red-500 font-medium">
            Segera lengkapi nilai harian
          </div>
        </div>
      </section>

      {/* Bento Grid: Live Input Nilai Table Preview */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Daftar Input Nilai — Rombel {activeRombel === 'ALL' ? 'Semua' : activeRombel}
            </h3>
            <p className="text-[11px] text-slate-500">
              Pratinjau status nilai siswa ({settings.semester_aktif.replace('_', ' ')})
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={previewSearch}
              onChange={(e) => setPreviewSearch(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-md w-40 sm:w-48 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
            <select
              value={previewSubjectId}
              onChange={(e) => setPreviewSubjectId(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden bg-white text-slate-700"
            >
              <option value="ALL">Mapel Pertama ({defaultSubj?.nama_mapel})</option>
              {activeSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_mapel}
                </option>
              ))}
            </select>
            <button
              onClick={() => setActiveTab('input-grades')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
            >
              Buka Input Nilai
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                <th className="px-6 py-3.5">NISN</th>
                <th className="px-6 py-3.5">Nama Lengkap</th>
                <th className="px-6 py-3.5 text-center">Nilai Rapor</th>
                <th className="px-6 py-3.5 text-center">Predikat</th>
                <th className="px-6 py-3.5 text-center">Status Ketuntasan</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
              {previewStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada data siswa ditemukan untuk rombel ini.
                  </td>
                </tr>
              ) : (
                previewStudents.map((std, idx) => {
                  const g = grades.find(
                    (item) =>
                      item.student_id === std.id &&
                      item.semester === settings.semester_aktif &&
                      item.subject_id === targetSubjId
                  );
                  const isFilled = g && g.nilai_akhir !== null;
                  const isEven = idx % 2 === 1;
                  const kktp = targetSubject?.kktp || 75;
                  const isTuntas = isFilled && (g.nilai_akhir ?? 0) >= kktp;

                  return (
                    <tr
                      key={std.id}
                      className={`hover:bg-blue-50/30 transition-colors ${
                        isEven ? 'bg-slate-50/20' : ''
                      } ${!isFilled ? 'text-slate-500' : ''}`}
                    >
                      <td className="px-6 py-3 font-mono text-xs text-slate-600">{std.nisn}</td>
                      <td className="px-6 py-3 font-medium text-slate-900">
                        {std.nama_lengkap}
                      </td>
                      <td className="px-6 py-3 text-center font-bold text-slate-900">
                        {isFilled ? g.nilai_akhir : '-'}
                      </td>
                      <td className="px-6 py-3 text-center">
                        {isFilled ? (
                          <span
                            className={`font-black ${
                              g.predikat === 'A'
                                ? 'text-blue-600'
                                : g.predikat === 'B'
                                ? 'text-emerald-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {g.predikat}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        {isFilled ? (
                          <span
                            className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${
                              isTuntas
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {isTuntas ? 'TUNTAS' : 'PERLU BIMBINGAN'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-md uppercase">
                            BELUM DINILAI
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium tracking-tight">
            SDN BABELAN KOTA 01 | Bekasi, Jawa Barat
          </span>
          <button
            onClick={() => setActiveTab('input-grades')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Lembar Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Bento Grid: Quick Access & Subject Progress Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Action Bento Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Akses Cepat Pengelolaan</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              Semester: {settings.semester_aktif}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('input-grades')}
              className="flex flex-col text-left p-3.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                Input Nilai Rapor
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                Praktik, tulis & catatan per mapel
              </p>
            </button>

            <button
              onClick={() => setActiveTab('recap-grades')}
              className="flex flex-col text-left p-3.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                Rekap Nilai Siswa
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                Riwayat semester kelas 4, 5, 6
              </p>
            </button>

            <button
              onClick={() => setActiveTab('school-exam')}
              className="flex flex-col text-left p-3.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                Ujian Sekolah (US)
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                Peringkat & kelulusan Kelas 6
              </p>
            </button>

            <button
              onClick={() => setActiveTab('print-reports')}
              className="flex flex-col text-left p-3.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Printer className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                Cetak SKL
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                Rekap Nilai Ijazah F4 Landscape & Surat Kelulusan
              </p>
            </button>
          </div>
        </div>

        {/* Subject Progress Bento Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Progres Input Nilai Per Mata Pelajaran
              </h3>
              <p className="text-[10px] text-slate-400">
                Rombel {activeRombel === 'ALL' ? 'Semua' : activeRombel} • KKTP: 75
              </p>
            </div>
            <button
              onClick={() => setActiveTab('input-grades')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Detail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {metrics.subjectProgress.map((item) => (
              <div
                key={item.subject.id}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800 truncate">
                    {item.subject.nama_mapel}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                      item.pct === 100
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.pct > 0
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.pct}% ({item.filledCount}/{item.total})
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.pct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
