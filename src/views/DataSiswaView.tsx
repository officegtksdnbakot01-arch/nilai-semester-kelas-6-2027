import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Student, Gender, StudentStatus } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ProfilSiswaModal } from './ProfilSiswaModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import { ExcelService } from '../services/excel';

export const DataSiswaView: React.FC<{ onNavigateToImport?: () => void }> = ({ onNavigateToImport }) => {
  const { currentUser, isAdmin, canAccessRombel } = useAuth();
  const { students, addStudent, updateStudent, deleteStudent, subjects, grades, schoolExams, settings, rombels } = useApp();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelas, setSelectedKelas] = useState<string>('ALL');
  const [selectedRombel, setSelectedRombel] = useState<string>(
    isAdmin ? 'ALL' : currentUser?.rombel || '6A'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    nama: '',
    jenis_kelamin: 'L' as Gender,
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '2014-05-10',
    orang_tua: '',
    kelas: '6' as '4' | '5' | '6',
    rombel: currentUser?.rombel || '6A',
    status: 'Aktif' as StudentStatus,
    alamat: '',
  });

  // Handle open add modal
  const handleOpenAdd = () => {
    const defaultRombel = !isAdmin && currentUser?.rombel ? currentUser.rombel : '6A';
    const defaultKelas = (defaultRombel.charAt(0) as '4' | '5' | '6') || '6';

    setEditingStudent(null);
    setFormData({
      nis: '',
      nisn: '',
      nama: '',
      jenis_kelamin: 'L',
      tempat_lahir: 'Bekasi',
      tanggal_lahir: '2014-05-10',
      orang_tua: '',
      kelas: defaultKelas,
      rombel: defaultRombel,
      status: 'Aktif',
      alamat: '',
    });
    setIsFormOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis,
      nisn: student.nisn,
      nama: student.nama,
      jenis_kelamin: student.jenis_kelamin,
      tempat_lahir: student.tempat_lahir,
      tanggal_lahir: student.tanggal_lahir,
      orang_tua: student.orang_tua,
      kelas: student.kelas,
      rombel: student.rombel,
      status: student.status,
      alamat: student.alamat || '',
    });
    setIsFormOpen(true);
  };

  // Save student
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      const ok = updateStudent({
        ...editingStudent,
        ...formData,
      });
      if (ok) setIsFormOpen(false);
    } else {
      const ok = addStudent(formData);
      if (ok) setIsFormOpen(false);
    }
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Permission check: if teacher, only show their rombel
      if (!isAdmin && currentUser?.rombel && s.rombel !== currentUser.rombel) {
        return false;
      }

      // Filter by Kelas
      if (selectedKelas !== 'ALL' && s.kelas !== selectedKelas) {
        return false;
      }

      // Filter by Rombel (admin)
      if (selectedRombel !== 'ALL' && s.rombel !== selectedRombel) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.nama.toLowerCase().includes(q);
        const matchNisn = s.nisn.includes(q);
        const matchNis = s.nis.includes(q);
        const matchOrtu = s.orang_tua.toLowerCase().includes(q);
        return matchName || matchNisn || matchNis || matchOrtu;
      }

      return true;
    });
  }, [students, isAdmin, currentUser, selectedKelas, selectedRombel, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const handleExportExcel = () => {
    const desc = selectedRombel !== 'ALL' ? `Rombel_${selectedRombel}` : (selectedKelas !== 'ALL' ? `Kelas_${selectedKelas}` : 'Semua');
    ExcelService.exportStudents(filteredStudents, settings, desc);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 mb-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Database Siswa Aktif</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Data Peserta Didik</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {filteredStudents.length} siswa terdaftar{' '}
            {!isAdmin && currentUser?.rombel ? `(Khusus Rombel ${currentUser.rombel})` : ''}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToImport && (
            <button
              onClick={onNavigateToImport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Excel</span>
            </button>
          )}

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama, NISN, atau orang tua..."
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-md outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {isAdmin && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Filter className="w-3.5 h-3.5" />
                <span>Kelas:</span>
              </div>
              <select
                value={selectedKelas}
                onChange={(e) => {
                  setSelectedKelas(e.target.value);
                  setSelectedRombel('ALL');
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold bg-white border border-slate-300 rounded-md px-2.5 py-1.5 outline-hidden text-slate-700 cursor-pointer"
              >
                <option value="ALL">Semua Kelas</option>
                <option value="4">Kelas 4</option>
                <option value="5">Kelas 5</option>
                <option value="6">Kelas 6</option>
              </select>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-2">
                <span>Rombel:</span>
              </div>
              <select
                value={selectedRombel}
                onChange={(e) => {
                  setSelectedRombel(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold bg-white border border-slate-300 rounded-md px-2.5 py-1.5 outline-hidden text-slate-700 cursor-pointer"
              >
                <option value="ALL">Semua Rombel</option>
                {rombels
                  .filter((r) => selectedKelas === 'ALL' || r.kelas === selectedKelas)
                  .map((r) => (
                    <option key={r.id} value={r.nama}>
                      Rombel {r.nama}
                    </option>
                  ))}
              </select>
            </>
          )}

          {!isAdmin && currentUser?.rombel && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Rombel {currentUser.rombel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3.5 w-12 text-center">No</th>
                <th className="px-4 py-3.5">NISN / NIS</th>
                <th className="px-4 py-3.5">Nama Lengkap Siswa</th>
                <th className="px-3 py-3.5 text-center">L/P</th>
                <th className="px-3 py-3.5 text-center">Rombel</th>
                <th className="px-4 py-3.5">Nama Orang Tua</th>
                <th className="px-3 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">Tidak ada data siswa ditemukan.</p>
                    <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter rombel.</p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s, idx) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                  const canEdit = canAccessRombel(s.rombel);

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-4 py-3 text-center font-mono text-slate-400">
                        {rowNumber}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-slate-800 block">{s.nisn}</span>
                        <span className="text-[10px] text-slate-400 font-mono">NIS: {s.nis}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setProfileStudent(s)}
                          className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left flex items-center gap-1.5 group cursor-pointer"
                        >
                          <span>{s.nama}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                        </button>
                        <span className="text-[10px] text-slate-500 block">
                          {s.tempat_lahir}, {s.tanggal_lahir}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            s.jenis_kelamin === 'L'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {s.jenis_kelamin}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-xs">
                          {s.rombel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {s.orang_tua || '-'}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setProfileStudent(s)}
                            title="Lihat Profil Rapor Siswa"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(s)}
                                title="Edit Data Siswa"
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setStudentToDelete(s)}
                                title="Hapus Siswa"
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} s.d.{' '}
            {Math.min(currentPage * itemsPerPage, filteredStudents.length)} dari{' '}
            {filteredStudents.length} siswa
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingStudent ? 'Edit Data Peserta Didik' : 'Tambah Peserta Didik Baru'}
        subtitle="Pastikan NISN dan NIS sesuai dengan data resmi Dapodik / Buku Induk"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                NISN (10 Digit) *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                placeholder="Contoh: 0148812301"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                NIS / Nomor Induk Sekolah *
              </label>
              <input
                type="text"
                required
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                placeholder="Contoh: 212204001"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Siswa *
              </label>
              <input
                type="text"
                required
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Muhammad Rizky Saputra"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jenis Kelamin *
              </label>
              <select
                value={formData.jenis_kelamin}
                onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as Gender })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 bg-white"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={formData.tempat_lahir}
                onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                placeholder="Contoh: Bekasi"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Lahir (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={formData.tanggal_lahir}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Orang Tua / Wali
              </label>
              <input
                type="text"
                value={formData.orang_tua}
                onChange={(e) => setFormData({ ...formData, orang_tua: e.target.value })}
                placeholder="Contoh: Bpk. Bambang & Ibu Siti"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tingkat Kelas *
              </label>
              <select
                disabled={!isAdmin && Boolean(currentUser?.rombel)}
                value={formData.kelas}
                onChange={(e) => {
                  const k = e.target.value as '4' | '5' | '6';
                  setFormData({
                    ...formData,
                    kelas: k,
                    rombel: `${k}A`,
                  });
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 bg-white disabled:bg-slate-100"
              >
                <option value="4">Kelas 4</option>
                <option value="5">Kelas 5</option>
                <option value="6">Kelas 6</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rombel *
              </label>
              <select
                disabled={!isAdmin && Boolean(currentUser?.rombel)}
                value={formData.rombel}
                onChange={(e) => setFormData({ ...formData, rombel: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 bg-white disabled:bg-slate-100"
              >
                {rombels
                  .filter((r) => r.kelas === formData.kelas)
                  .map((r) => (
                    <option key={r.id} value={r.nama}>
                      Rombel {r.nama}
                    </option>
                  ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Tempat Tinggal
              </label>
              <textarea
                rows={2}
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Contoh: Jl. Raya Babelan Kota RT 02/RW 03, Babelan"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) {
            deleteStudent(studentToDelete.id);
          }
        }}
        title="Konfirmasi Hapus Peserta Didik"
        message={`Apakah Anda yakin ingin menghapus data siswa ${studentToDelete?.nama} (${studentToDelete?.nisn})? Seluruh riwayat nilai semester yang terkait juga akan dihapus.`}
        confirmLabel="Hapus Siswa"
        isDangerous
      />

      {/* Profil Rapor Siswa Modal */}
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
