import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SemesterCode, Student } from '../types';
import { ProfilSiswaModal } from './ProfilSiswaModal';
import {
  BarChart3,
  Download,
  Printer,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  BookOpen,
} from 'lucide-react';
import { ExcelService } from '../services/excel';
import { PrintService } from '../services/printService';

export const RekapNilaiView: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { students, subjects, grades, schoolExams, settings, rombels } = useApp();

  // Filters
  const defaultRombel = !isAdmin && currentUser?.rombel ? currentUser.rombel : '6A';
  const [selectedRombel, setSelectedRombel] = useState<string>(defaultRombel);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'nama' | 'nisn' | 'nilai_akhir'>('nama');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [isPrinting, setIsPrinting] = useState(false);

  // Monitor window beforeprint / afterprint
  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Selected student for Profile modal
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);

  // Target students
  const filteredStudents = useMemo(() => {
    let list = students.filter((s) => s.rombel === selectedRombel);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) => s.nama.toLowerCase().includes(q) || s.nisn.includes(q) || s.nis.includes(q)
      );
    }

    return list;
  }, [students, selectedRombel, searchQuery]);

  // Compute multi-semester matrix for each student
  const recapData = useMemo(() => {
    const data = filteredStudents.map((s, idx) => {
      const getScore = (sem: SemesterCode) => {
        const g = grades.find(
          (gr) =>
            gr.student_id === s.id &&
            gr.subject_id === selectedSubjectId &&
            gr.semester === sem
        );
        return g?.nilai_akhir ?? null;
      };

      const s1_k4 = getScore('Smt1_Kls4');
      const s2_k4 = getScore('Smt2_Kls4');
      const s1_k5 = getScore('Smt1_Kls5');
      const s2_k5 = getScore('Smt2_Kls5');
      const s1_k6 = getScore('Smt1_Kls6');
      const s2_k6 = getScore('Smt2_Kls6');

      // Current semester score
      const currentGrade = grades.find(
        (gr) =>
          gr.student_id === s.id &&
          gr.subject_id === selectedSubjectId &&
          gr.semester === settings.semester_aktif
      );

      return {
        student: s,
        s1_k4,
        s2_k4,
        s1_k5,
        s2_k5,
        s1_k6,
        s2_k6,
        praktik: currentGrade?.nilai_praktik ?? null,
        tulis: currentGrade?.nilai_tulis ?? null,
        nilai_akhir: currentGrade?.nilai_akhir ?? null,
        predikat: currentGrade?.predikat ?? '-',
      };
    });

    // Sorting
    data.sort((a, b) => {
      if (sortField === 'nama') {
        const cmp = a.student.nama.localeCompare(b.student.nama);
        return sortOrder === 'asc' ? cmp : -cmp;
      } else if (sortField === 'nisn') {
        const cmp = a.student.nisn.localeCompare(b.student.nisn);
        return sortOrder === 'asc' ? cmp : -cmp;
      } else {
        const scoreA = a.nilai_akhir ?? -1;
        const scoreB = b.nilai_akhir ?? -1;
        return sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      }
    });

    return data;
  }, [filteredStudents, grades, selectedSubjectId, settings.semester_aktif, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(recapData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return recapData.slice(start, start + itemsPerPage);
  }, [recapData, currentPage]);

  const handleToggleSort = (field: 'nama' | 'nisn' | 'nilai_akhir') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExportExcel = () => {
    ExcelService.exportGradeRecap(
      students,
      subjects,
      grades,
      settings,
      selectedRombel,
      selectedSubjectId
    );
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      PrintService.triggerPrint({
        orientation: 'landscape',
        title: `Rekap_Nilai_${selectedRombel}_${currentSubject?.nama_mapel?.replace(/[^a-zA-Z0-9]/g, '_') || 'Mapel'}`,
      });
      setTimeout(() => setIsPrinting(false), 2500);
    }, 100);
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const dataToRender = isPrinting ? recapData : paginatedData;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 mb-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Rekapitulasi Semester</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Rekapitulasi Nilai Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Matriks riwayat nilai semester 1 & 2 kelas 4 s.d. kelas 6 Kurikulum Merdeka (Standar A4 Landscape).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Rekap Excel</span>
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

      {/* Filter and search bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between no-print">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama atau NISN siswa..."
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-md outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Rombel Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-bold">Rombel:</span>
            <select
              disabled={!isAdmin && Boolean(currentUser?.rombel)}
              value={selectedRombel}
              onChange={(e) => {
                setSelectedRombel(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-bold bg-white border border-slate-300 rounded-md px-2.5 py-1.5 outline-hidden text-slate-800 disabled:bg-slate-100 cursor-pointer"
            >
              {rombels.map((r) => (
                <option key={r.id} value={r.nama}>
                  Rombel {r.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-bold">Mata Pelajaran:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-bold bg-white border border-slate-300 rounded-md px-2.5 py-1.5 outline-hidden text-slate-800 cursor-pointer"
            >
              {subjects
                .filter((s) => s.aktif)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama_mapel} ({s.kode})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Official Printable Kop (only visible during print) */}
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
            REKAPITULASI NILAI RAPOR KELAS 4 - 6 • MAPEL: {currentSubject?.nama_mapel?.toUpperCase()} • ROMBEL {selectedRombel}
          </p>
        </div>
      </div>

      {/* Recap Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden printable-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-center">
                <th rowSpan={2} className="px-3 py-3 w-10 text-center">No</th>
                <th
                  rowSpan={2}
                  onClick={() => handleToggleSort('nisn')}
                  className="px-3 py-3 w-28 text-left cursor-pointer hover:bg-slate-200/60"
                >
                  <div className="flex items-center gap-1">
                    <span>NISN</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  rowSpan={2}
                  onClick={() => handleToggleSort('nama')}
                  className="px-4 py-3 min-w-[180px] text-left cursor-pointer hover:bg-slate-200/60"
                >
                  <div className="flex items-center gap-1">
                    <span>Nama Siswa</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th colSpan={2} className="px-2 py-1.5 border-l border-slate-200 bg-blue-50 text-blue-900">
                  Kelas 4
                </th>
                <th colSpan={2} className="px-2 py-1.5 border-l border-slate-200 bg-emerald-50 text-emerald-900">
                  Kelas 5
                </th>
                <th colSpan={2} className="px-2 py-1.5 border-l border-slate-200 bg-amber-50 text-amber-900">
                  Kelas 6
                </th>
                <th
                  rowSpan={2}
                  onClick={() => handleToggleSort('nilai_akhir')}
                  className="px-3 py-3 border-l border-slate-200 bg-blue-100/70 text-blue-900 cursor-pointer hover:bg-blue-200/70 text-center w-28"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Nilai Rapor Aktif</span>
                    <ArrowUpDown className="w-3 h-3 text-blue-600" />
                  </div>
                </th>
                <th rowSpan={2} className="px-3 py-3 text-center border-l border-slate-200 w-16">
                  Predikat
                </th>
                <th rowSpan={2} className="px-3 py-3 text-center no-print w-16">
                  Detail
                </th>
              </tr>
              <tr className="bg-slate-50 text-slate-600 text-[11px] font-bold border-b border-slate-200 text-center">
                <th className="px-2 py-1.5 border-l border-slate-200">Smt 1</th>
                <th className="px-2 py-1.5">Smt 2</th>
                <th className="px-2 py-1.5 border-l border-slate-200">Smt 1</th>
                <th className="px-2 py-1.5">Smt 2</th>
                <th className="px-2 py-1.5 border-l border-slate-200">Smt 1</th>
                <th className="px-2 py-1.5">Smt 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataToRender.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-slate-400">
                    Tidak ada data rekap nilai untuk rombel ini.
                  </td>
                </tr>
              ) : (
                dataToRender.map((item, idx) => {
                  const rowNumber = isPrinting ? idx + 1 : (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr key={item.student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3 py-2 text-center font-mono text-slate-400">{rowNumber}</td>
                      <td className="px-3 py-2 font-mono font-semibold text-slate-700">{item.student.nisn}</td>
                      <td className="px-4 py-2 font-bold text-slate-900">
                        <button
                          onClick={() => setProfileStudent(item.student)}
                          className="hover:text-blue-600 text-left transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{item.student.nama}</span>
                        </button>
                      </td>
                      <td className="px-2 py-2 text-center border-l border-slate-100 font-medium">{item.s1_k4 ?? '-'}</td>
                      <td className="px-2 py-2 text-center font-medium">{item.s2_k4 ?? '-'}</td>
                      <td className="px-2 py-2 text-center border-l border-slate-100 font-medium">{item.s1_k5 ?? '-'}</td>
                      <td className="px-2 py-2 text-center font-medium">{item.s2_k5 ?? '-'}</td>
                      <td className="px-2 py-2 text-center border-l border-slate-100 font-medium">{item.s1_k6 ?? '-'}</td>
                      <td className="px-2 py-2 text-center font-medium">{item.s2_k6 ?? '-'}</td>
                      <td className="px-3 py-2 text-center font-black bg-blue-50/50 text-blue-900 text-xs border-l border-slate-200">
                        {item.nilai_akhir ?? '-'}
                      </td>
                      <td className="px-2 py-2 text-center border-l border-slate-100 font-bold">
                        {item.predikat !== '-' ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] ${
                              item.predikat === 'A'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.predikat === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.predikat}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-2 py-2 text-center no-print">
                        <button
                          onClick={() => setProfileStudent(item.student)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
            <p>Guru Kelas / Rombel {selectedRombel}</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{currentUser?.nama || '....................................'}</p>
            <p>NIP. {currentUser?.nip || '-'}</p>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 no-print">
          <div>
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} s.d.{' '}
            {Math.min(currentPage * itemsPerPage, recapData.length)} dari {recapData.length} siswa
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Profil Siswa Modal */}
      <ProfilSiswaModal
        isOpen={Boolean(profileStudent)}
        onClose={() => setProfileStudent(null)}
        student={profileStudent}
        subjects={subjects}
        grades={grades}
        schoolExams={schoolExams}
        settings={settings}
      />
    </div>
  );
};
