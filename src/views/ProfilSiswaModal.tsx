import React, { useState } from 'react';
import { Student, Subject, Grade, SchoolExam, SchoolSettings, SemesterCode } from '../types';
import { Modal } from '../components/common/Modal';
import { Printer, Award, User, BookOpen, CheckCircle, Calendar, LayoutTemplate } from 'lucide-react';
import { PrintService } from '../services/printService';

interface ProfilSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  subjects: Subject[];
  grades: Grade[];
  schoolExams: SchoolExam[];
  settings: SchoolSettings;
}

export const ProfilSiswaModal: React.FC<ProfilSiswaModalProps> = ({
  isOpen,
  onClose,
  student,
  subjects,
  grades,
  schoolExams,
  settings,
}) => {
  if (!student) return null;

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const semesters: { code: SemesterCode; label: string; kelas: string }[] = [
    { code: 'Smt1_Kls4', label: 'Semester 1', kelas: 'Kelas 4' },
    { code: 'Smt2_Kls4', label: 'Semester 2', kelas: 'Kelas 4' },
    { code: 'Smt1_Kls5', label: 'Semester 1', kelas: 'Kelas 5' },
    { code: 'Smt2_Kls5', label: 'Semester 2', kelas: 'Kelas 5' },
    { code: 'Smt1_Kls6', label: 'Semester 1', kelas: 'Kelas 6' },
    { code: 'Smt2_Kls6', label: 'Semester 2', kelas: 'Kelas 6' },
  ];

  const handlePrintSingleReport = () => {
    PrintService.triggerPrint({
      orientation,
      title: `Rapor_Profil_${student.nama.replace(/[^a-zA-Z0-9]/g, '_')}_${student.nisn}`,
    });
  };

  const activeSubjects = subjects.filter((s) => s.aktif);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PROFIL & RIWAYAT NILAI RAPOR SISWA"
      subtitle={`${settings.nama_sekolah} • Tahun Ajaran ${settings.tahun_ajaran}`}
      maxWidth="4xl"
    >
      <div className="space-y-6 text-slate-800 printable-card">
        {/* Header Action & Print button */}
        <div className="flex flex-wrap items-center justify-between gap-3 no-print bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              Rombel {student.rombel}
            </span>
            <span className="text-xs text-slate-500 font-medium">Status: {student.status}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick orientation toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  orientation === 'portrait' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Format Tegak (Standar Rapor Siswa)"
              >
                A4 Portrait
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  orientation === 'landscape' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Format Mendatar"
              >
                A4 Landscape
              </button>
            </div>

            <button
              onClick={handlePrintSingleReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
              title="Buka dialog cetak atau Simpan sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Unduh PDF ({orientation === 'landscape' ? 'A4 Landscape' : 'A4 Portrait'})</span>
            </button>
          </div>
        </div>

        {/* Printable Official Kop (only visible during print) */}
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
              LEMBAR LAPORAN CAPAIAN HASIL BELAJAR PESERTA DIDIK
            </p>
          </div>
        </div>

        {/* Identitas Siswa Box */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-extrabold text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Identitas Peserta Didik</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2.5 gap-x-6 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Nama Lengkap</span>
              <span className="text-slate-900 font-bold text-sm">{student.nama}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">NISN / NIS</span>
              <span className="text-slate-800 font-semibold">{student.nisn} / {student.nis}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Jenis Kelamin</span>
              <span className="text-slate-800 font-semibold">
                {student.jenis_kelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Tempat, Tanggal Lahir</span>
              <span className="text-slate-800 font-semibold">{student.tempat_lahir}, {student.tanggal_lahir}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Nama Orang Tua / Wali</span>
              <span className="text-slate-800 font-semibold">{student.orang_tua}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Kelas & Rombel</span>
              <span className="text-slate-800 font-semibold">Kelas {student.kelas} • Rombel {student.rombel}</span>
            </div>
          </div>
        </div>

        {/* Riwayat Nilai Rapor Semester (Kelas 4, 5, 6) */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                Riwayat Nilai Rapor (Kurikulum Merdeka)
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Kelas 4 s.d Kelas 6</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 text-center font-bold">
                  <th rowSpan={2} className="px-3 py-2 text-left w-8">No</th>
                  <th rowSpan={2} className="px-3 py-2 text-left">Mata Pelajaran</th>
                  <th colSpan={2} className="px-2 py-1.5 border-l border-slate-200 bg-blue-50/50 text-blue-900">Kelas 4</th>
                  <th colSpan={2} className="px-2 py-1.5 border-l border-slate-200 bg-emerald-50/50 text-emerald-900">Kelas 5</th>
                  <th colSpan={2} className="px-2 py-1.5 border-l border-slate-200 bg-amber-50/50 text-amber-900">Kelas 6</th>
                  <th rowSpan={2} className="px-3 py-2 border-l border-slate-200 bg-slate-200/60">Rata2 Rapor</th>
                </tr>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-center text-[11px]">
                  <th className="px-2 py-1 border-l border-slate-200">Smt 1</th>
                  <th className="px-2 py-1">Smt 2</th>
                  <th className="px-2 py-1 border-l border-slate-200">Smt 1</th>
                  <th className="px-2 py-1">Smt 2</th>
                  <th className="px-2 py-1 border-l border-slate-200">Smt 1</th>
                  <th className="px-2 py-1">Smt 2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSubjects.map((subj, idx) => {
                  const getVal = (code: SemesterCode) => {
                    const g = grades.find((gr) => gr.student_id === student.id && gr.subject_id === subj.id && gr.semester === code);
                    return g?.nilai_akhir ?? null;
                  };

                  const s1_4 = getVal('Smt1_Kls4');
                  const s2_4 = getVal('Smt2_Kls4');
                  const s1_5 = getVal('Smt1_Kls5');
                  const s2_5 = getVal('Smt2_Kls5');
                  const s1_6 = getVal('Smt1_Kls6');
                  const s2_6 = getVal('Smt2_Kls6');

                  const validScores = [s1_4, s2_4, s1_5, s2_5, s1_6, s2_6].filter((v): v is number => v !== null);
                  const average = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : null;

                  return (
                    <tr key={subj.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="px-3 py-2 font-semibold text-slate-900">{subj.nama_mapel}</td>
                      <td className="px-2 py-2 text-center border-l border-slate-100 font-medium">{s1_4 ?? '-'}</td>
                      <td className="px-2 py-2 text-center font-medium">{s2_4 ?? '-'}</td>
                      <td className="px-2 py-2 text-center border-l border-slate-100 font-medium">{s1_5 ?? '-'}</td>
                      <td className="px-2 py-2 text-center font-medium">{s2_5 ?? '-'}</td>
                      <td className="px-2 py-2 text-center border-l border-slate-100 font-medium">{s1_6 ?? '-'}</td>
                      <td className="px-2 py-2 text-center font-medium">{s2_6 ?? '-'}</td>
                      <td className="px-3 py-2 text-center border-l border-slate-200 font-bold bg-slate-50 text-blue-700">
                        {average ?? '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nilai Ujian Sekolah Section (Kelas 6) */}
        {student.kelas === '6' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-amber-50/70 border-b border-amber-200/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs sm:text-sm font-extrabold text-amber-900 uppercase tracking-wide">
                  Hasil Nilai Ujian Sekolah (US) 2026/2027
                </h4>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                Kelulusan SD
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-center font-bold border-b border-slate-200">
                    <th className="px-3 py-2 text-left w-8">No</th>
                    <th className="px-3 py-2 text-left">Mata Pelajaran Ujian</th>
                    <th className="px-3 py-2">Nilai Praktik</th>
                    <th className="px-3 py-2">Nilai Tulis</th>
                    <th className="px-3 py-2 bg-amber-100/60 text-amber-900">Nilai Akhir US</th>
                    <th className="px-3 py-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeSubjects.map((subj, idx) => {
                    const exam = schoolExams.find((e) => e.student_id === student.id && e.subject_id === subj.id);
                    const nilaiAkhir = exam?.nilai ?? null;
                    const isTuntas = nilaiAkhir !== null && nilaiAkhir >= settings.kktp_default;

                    return (
                      <tr key={subj.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="px-3 py-2 font-semibold text-slate-900">{subj.nama_mapel}</td>
                        <td className="px-3 py-2 text-center">{exam?.nilai_praktik ?? '-'}</td>
                        <td className="px-3 py-2 text-center">{exam?.nilai_tulis ?? '-'}</td>
                        <td className="px-3 py-2 text-center font-bold text-slate-900 bg-amber-50/40">
                          {nilaiAkhir ?? '-'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {nilaiAkhir !== null ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isTuntas
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" />
                              {isTuntas ? 'Tuntas' : 'Perlu Bimbingan'}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tanda Tangan Resmi Rapor (Hanya tampil saat dicetak) */}
        <div className="hidden print:grid grid-cols-2 gap-8 pt-8 text-xs text-center font-serif">
          <div>
            <p>Mengetahui,</p>
            <p>Orang Tua / Wali Peserta Didik,</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{student.nama_ortu || '....................................'}</p>
          </div>
          <div>
            <p>{settings.kecamatan || 'Bekasi'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p>Guru Kelas / Rombel {student.rombel}</p>
            <div className="h-16"></div>
            <p className="font-bold underline">................................................</p>
            <p>NIP. ........................................</p>
          </div>
        </div>

        {/* Footer info & signatures */}
        <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Dicetak tanggal: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
          </div>
          <p className="font-semibold text-slate-600">
            {settings.nama_sekolah} • {settings.kecamatan}, {settings.kabupaten}
          </p>
        </div>
      </div>
    </Modal>
  );
};
