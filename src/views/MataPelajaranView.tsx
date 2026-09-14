import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Subject } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Award,
} from 'lucide-react';

export const MataPelajaranView: React.FC = () => {
  const { isAdmin } = useAuth();
  const { subjects, addSubject, updateSubject, deleteSubject, addToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const [formData, setFormData] = useState({
    kode: '',
    nama_mapel: '',
    kategori: 'Umum' as 'Umum' | 'Muatan Lokal' | 'Pilihan',
    kktp: 75,
    aktif: true,
  });

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({
      kode: '',
      nama_mapel: '',
      kategori: 'Umum',
      kktp: 75,
      aktif: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subj: Subject) => {
    setEditingSubject(subj);
    setFormData({
      kode: subj.kode,
      nama_mapel: subj.nama_mapel,
      kategori: subj.kategori,
      kktp: subj.kktp,
      aktif: subj.aktif,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kode.trim() || !formData.nama_mapel.trim()) {
      addToast('error', 'Kode dan Nama Mata Pelajaran wajib diisi.');
      return;
    }

    if (editingSubject) {
      updateSubject({
        ...editingSubject,
        ...formData,
      });
    } else {
      addSubject(formData);
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (subj: Subject) => {
    if (!isAdmin) return;
    updateSubject({
      ...subj,
      aktif: !subj.aktif,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Mata Pelajaran Kurikulum Merdeka
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar mata pelajaran resmi, kategori kurikulum, dan Kriteria Ketercapaian Tujuan Pembelajaran (KKTP).
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mapel</span>
          </button>
        )}
      </div>

      {/* Subjects Grid/Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="px-4 py-3.5 w-12 text-center">No</th>
                <th className="px-4 py-3.5 w-24">Kode</th>
                <th className="px-4 py-3.5">Nama Mata Pelajaran</th>
                <th className="px-4 py-3.5 w-36">Kategori</th>
                <th className="px-4 py-3.5 w-24 text-center">KKTP Minimal</th>
                <th className="px-4 py-3.5 w-28 text-center">Status</th>
                {isAdmin && <th className="px-4 py-3.5 w-28 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((subj, idx) => (
                <tr key={subj.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-blue-700 bg-blue-50/30">
                    {subj.kode}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                    {subj.nama_mapel}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        subj.kategori === 'Muatan Lokal'
                          ? 'bg-amber-100 text-amber-900'
                          : subj.kategori === 'Pilihan'
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {subj.kategori}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-black text-slate-800">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                      {subj.kktp}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => toggleStatus(subj)}
                      disabled={!isAdmin}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                        subj.aktif
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      } ${isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                    >
                      {subj.aktif ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Nonaktif</span>
                        </>
                      )}
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(subj)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSubjectToDelete(subj)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
        subtitle="Struktur mata pelajaran resmi Kurikulum Merdeka Sekolah Dasar"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kode Mata Pelajaran *
            </label>
            <input
              type="text"
              required
              value={formData.kode}
              onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
              placeholder="Contoh: B.IND, MTK, IPAS"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Mata Pelajaran *
            </label>
            <input
              type="text"
              required
              value={formData.nama_mapel}
              onChange={(e) => setFormData({ ...formData, nama_mapel: e.target.value })}
              placeholder="Contoh: Pendidikan Pancasila"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 bg-white cursor-pointer"
              >
                <option value="Umum">Umum</option>
                <option value="Muatan Lokal">Muatan Lokal</option>
                <option value="Pilihan">Pilihan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                KKTP Standar
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.kktp}
                onChange={(e) => setFormData({ ...formData, kktp: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="mapel-aktif"
              checked={formData.aktif}
              onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
              className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="mapel-aktif" className="text-xs font-medium text-slate-700 cursor-pointer">
              Aktifkan mata pelajaran ini di lembar input nilai
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              {editingSubject ? 'Simpan Perubahan' : 'Tambahkan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={Boolean(subjectToDelete)}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={() => {
          if (subjectToDelete) {
            deleteSubject(subjectToDelete.id);
          }
        }}
        title="Hapus Mata Pelajaran"
        message={`Apakah Anda yakin ingin menghapus mata pelajaran "${subjectToDelete?.nama_mapel}"?`}
        confirmLabel="Hapus Mapel"
        isDangerous
      />
    </div>
  );
};
