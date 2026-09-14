import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SchoolSettings, SemesterCode, RombelInfo, User } from '../types';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Modal } from '../components/common/Modal';
import {
  Settings,
  School,
  Save,
  RotateCcw,
  Download,
  Upload,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Edit3,
  Key,
  UserCheck,
  Shield,
} from 'lucide-react';
import { StorageService } from '../services/storage';

export const PengaturanView: React.FC = () => {
  const { isAdmin } = useAuth();
  const {
    settings,
    updateSettings,
    rombels,
    updateRombel,
    users,
    updateUser,
    resetToDefaults,
    addToast,
  } = useApp();

  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [backupJson, setBackupJson] = useState<string | null>(null);

  // Edit Guru Kelas State
  const [editingRombel, setEditingRombel] = useState<RombelInfo | null>(null);
  const [editGuruForm, setEditGuruForm] = useState({
    wali_kelas: '',
    nip_wali_kelas: '',
    ruangan: '',
    kapasitas: 32,
  });

  // Edit User Account State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    nama: '',
    username: '',
    password: '',
    nip: '',
  });

  const handleOpenEditGuru = (rombel: RombelInfo) => {
    setEditingRombel(rombel);
    setEditGuruForm({
      wali_kelas: rombel.wali_kelas || '',
      nip_wali_kelas: rombel.nip_wali_kelas || rombel.nip_wali || '',
      ruangan: rombel.ruangan || '',
      kapasitas: rombel.kapasitas || 32,
    });
  };

  const handleSaveGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRombel) return;
    if (!editGuruForm.wali_kelas.trim()) {
      addToast('error', 'Nama Guru / Wali Kelas tidak boleh kosong.');
      return;
    }

    updateRombel({
      ...editingRombel,
      wali_kelas: editGuruForm.wali_kelas.trim(),
      nip_wali_kelas: editGuruForm.nip_wali_kelas.trim(),
      nip_wali: editGuruForm.nip_wali_kelas.trim(),
      ruangan: editGuruForm.ruangan.trim(),
      kapasitas: Number(editGuruForm.kapasitas) || 32,
    });

    setEditingRombel(null);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserForm({
      nama: user.nama || '',
      username: user.username || '',
      password: user.password || 'password123',
      nip: user.nip || '',
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editUserForm.nama.trim() || !editUserForm.username.trim()) {
      addToast('error', 'Nama dan Username akun tidak boleh kosong.');
      return;
    }

    updateUser({
      ...editingUser,
      nama: editUserForm.nama.trim(),
      username: editUserForm.username.trim().toLowerCase(),
      password: editUserForm.password.trim() || 'password123',
      nip: editUserForm.nip.trim(),
    });

    setEditingUser(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.bobot_praktik + formData.bobot_tulis !== 100) {
      addToast('error', 'Total bobot nilai praktik dan tulis harus berjumlah 100%.');
      return;
    }

    updateSettings(formData);
  };

  const handleDownloadBackup = () => {
    const jsonStr = StorageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_SDN_Babelan_Kota_01_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', 'File cadangan data (backup) berhasil diunduh.');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ok = StorageService.importBackupJson(content);
        if (ok) {
          addToast('success', 'Data berhasil dipulihkan! Halaman akan dimuat ulang.');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          addToast('error', 'Format file cadangan tidak valid.');
        }
      } catch (err) {
        addToast('error', 'Gagal memproses file JSON cadangan.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 mb-1.5">
            <Settings className="w-3.5 h-3.5" />
            <span>Konfigurasi & Administrasi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Pengaturan Identitas & Penilaian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi profil sekolah, kurikulum, bobot perhitungan nilai rapor, dan pencadangan data.
          </p>
        </div>

        {isAdmin && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mode Administrator Aktif</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Profil Sekolah */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <School className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Identitas Satuan Pendidikan
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Nama Sekolah Resmi *
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.nama_sekolah}
                onChange={(e) => setFormData({ ...formData, nama_sekolah: e.target.value })}
                className="w-full text-xs font-bold px-3 py-1.5 border border-slate-300 rounded-md outline-hidden focus:border-blue-500 bg-white disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                NPSN *
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.npsn}
                onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                className="w-full text-xs font-mono font-bold px-3 py-1.5 border border-slate-300 rounded-md outline-hidden focus:border-blue-500 bg-white disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                NSS (Nomor Statistik Sekolah)
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.nss}
                onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
                className="w-full text-xs font-mono px-3 py-1.5 border border-slate-300 rounded-md outline-hidden focus:border-blue-500 bg-white disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.kecamatan}
                onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-md outline-hidden focus:border-blue-500 bg-white disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Kabupaten / Kota
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.kabupaten}
                onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-md outline-hidden focus:border-blue-500 bg-white disabled:bg-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Alamat Lengkap Sekolah
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.alamat_sekolah}
                onChange={(e) => setFormData({ ...formData, alamat_sekolah: e.target.value })}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-md outline-hidden focus:border-blue-500 bg-white disabled:bg-slate-100"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                URL Logo Sekolah Resmi
              </label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 p-1 flex items-center justify-center border border-slate-300 shrink-0 shadow-2xs">
                  <img
                    src={formData.logo_url || 'https://i.ibb.co.com/rRhHc2PD/logo-bakot-01.png'}
                    alt="Logo Sekolah"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.logo_url || ''}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://i.ibb.co.com/rRhHc2PD/logo-bakot-01.png"
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-md outline-hidden focus:border-blue-500 bg-white disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Nama Kepala Sekolah *
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.nama_kepsek || formData.nama_kepala_sekolah || ''}
                onChange={(e) => setFormData({ ...formData, nama_kepsek: e.target.value, nama_kepala_sekolah: e.target.value })}
                className="w-full text-xs font-bold px-3 py-1.5 border border-slate-300 rounded-md outline-hidden focus:border-blue-500 bg-white disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                NIP Kepala Sekolah *
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.nip_kepsek || formData.nip_kepala_sekolah || ''}
                onChange={(e) => setFormData({ ...formData, nip_kepsek: e.target.value, nip_kepala_sekolah: e.target.value })}
                className="w-full text-xs font-mono font-bold px-3 py-1.5 border border-slate-300 rounded-md outline-hidden focus:border-blue-500 bg-white disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Tahun Ajaran & Bobot Penilaian */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tahun Ajaran & Bobot Penilaian
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Tahun Ajaran
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.tahun_ajaran}
                onChange={(e) => setFormData({ ...formData, tahun_ajaran: e.target.value })}
                className="w-full text-xs font-bold px-3 py-1.5 border border-slate-300 rounded-md outline-hidden focus:border-blue-500 bg-white disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Semester Berjalan (Aktif)
              </label>
              <select
                disabled={!isAdmin}
                value={formData.semester_aktif}
                onChange={(e) => setFormData({ ...formData, semester_aktif: e.target.value as SemesterCode })}
                className="w-full text-xs font-bold px-3 py-1.5 border border-slate-300 rounded-md outline-hidden focus:border-blue-500 bg-white disabled:bg-slate-100 cursor-pointer"
              >
                <option value="Smt1_Kls4">Semester 1 (Kelas 4)</option>
                <option value="Smt2_Kls4">Semester 2 (Kelas 4)</option>
                <option value="Smt1_Kls5">Semester 1 (Kelas 5)</option>
                <option value="Smt2_Kls5">Semester 2 (Kelas 5)</option>
                <option value="Smt1_Kls6">Semester 1 (Kelas 6)</option>
                <option value="Smt2_Kls6">Semester 2 (Kelas 6)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Bobot Nilai Praktik (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                disabled={!isAdmin}
                value={formData.bobot_praktik}
                onChange={(e) => {
                  const p = Number(e.target.value);
                  setFormData({
                    ...formData,
                    bobot_praktik: p,
                    bobot_tulis: 100 - p,
                  });
                }}
                className="w-full text-xs font-bold px-3 py-1.5 border border-slate-300 rounded-md outline-hidden focus:border-blue-500 bg-white disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Bobot Nilai Tulis (%)
              </label>
              <input
                type="number"
                disabled
                value={formData.bobot_tulis}
                className="w-full text-xs font-bold px-3 py-1.5 border border-slate-300 rounded-md outline-hidden bg-slate-100 text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Save Button for Admin */}
        {isAdmin && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Pengaturan</span>
            </button>
          </div>
        )}
      </form>

      {/* Section 3: Pembagian Rombel & Wali Kelas (Hanya Kelas 6A, 6B, 6C, 6D) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Struktur Rombongan Belajar (Rombel) & Wali Kelas 6
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60">
            Hanya Jenjang Kelas 6 (6A, 6B, 6C, 6D)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {rombels.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-blue-700">Rombel {r.nama}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    Kelas {r.kelas}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-snug">{r.wali_kelas}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    NIP. {r.nip_wali_kelas || r.nip_wali || '-'}
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200/70 flex items-center justify-between">
                  <span>Ruang: {r.ruangan || '-'}</span>
                  <span>Maks: {r.kapasitas || 32} Siswa</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenEditGuru(r)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-blue-700 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Guru Kelas</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3.5: Daftar Akun Pengguna Sistem (Khusus Guru 6A–6D & Administrator) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Manajemen Akun Pengguna (Guru Kelas 6A–6D & Administrator)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Total {users.length} Akun Aktif Terdaftar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between space-y-2.5"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {u.role === 'admin' ? 'Administrator' : `Guru Rombel ${u.rombel}`}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    user: <strong>{u.username}</strong>
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">{u.nama}</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {u.nip ? `NIP. ${u.nip}` : 'Hak Akses Sistem Penuh'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  Pass: {u.password ? '••••••••' : 'default'}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenEditUser(u)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 text-slate-500" />
                  <span>Edit Akun</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Cadangan & Pemulihan Data (Backup & Reset) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layers className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Manajemen Data & Cadangan Lokal
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Cadangkan Data (JSON)</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Unduh seluruh data siswa, riwayat nilai semester 1 & 2, dan ujian sekolah sebagai file cadangan.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup</span>
            </button>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Pulihkan Data (Restore)</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Unggah file JSON cadangan untuk mengembalikan kondisi data aplikasi.
              </p>
            </div>
            <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih File Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-4 rounded-lg border border-rose-200 bg-rose-50/50 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-rose-900">Reset ke Data Awal</h4>
              <p className="text-[11px] text-rose-700/90 mt-1">
                Kembalikan data contoh awal SDN BABELAN KOTA 01 lengkap dengan siswa dan nilai demonstrasi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Aplikasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm reset dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          resetToDefaults();
          addToast('info', 'Data berhasil diatur ulang ke data bawaan.');
        }}
        title="Konfirmasi Reset Data"
        message="Apakah Anda yakin ingin mengatur ulang data ke data demonstrasi awal? Semua perubahan data yang belum dicadangkan akan hilang."
        confirmLabel="Ya, Reset Data"
        isDangerous
      />

      {/* Modal Edit Guru Kelas & Rombel */}
      {editingRombel && (
        <Modal
          isOpen={true}
          onClose={() => setEditingRombel(null)}
          title={`Edit Guru / Wali Kelas ${editingRombel.nama}`}
          subtitle={`Perbarui identitas wali kelas dan ruang belajar kelas ${editingRombel.nama}`}
        >
          <form onSubmit={handleSaveGuru} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap & Gelar Wali Kelas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editGuruForm.wali_kelas}
                onChange={(e) => setEditGuruForm({ ...editGuruForm, wali_kelas: e.target.value })}
                placeholder="Contoh: Sri Handayani, S.Pd."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                NIP Wali Kelas
              </label>
              <input
                type="text"
                value={editGuruForm.nip_wali_kelas}
                onChange={(e) => setEditGuruForm({ ...editGuruForm, nip_wali_kelas: e.target.value })}
                placeholder="Contoh: 19820514 200801 2 007"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ruangan Kelas
                </label>
                <input
                  type="text"
                  value={editGuruForm.ruangan}
                  onChange={(e) => setEditGuruForm({ ...editGuruForm, ruangan: e.target.value })}
                  placeholder="Contoh: Gedung A R.01"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kapasitas Siswa
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={editGuruForm.kapasitas}
                  onChange={(e) => setEditGuruForm({ ...editGuruForm, kapasitas: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingRombel(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Edit Akun Pengguna */}
      {editingUser && (
        <Modal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          title={`Edit Akun Pengguna: ${editingUser.username}`}
          subtitle={`Ubah nama tampilan, username, password, atau NIP akun`}
        >
          <form onSubmit={handleSaveUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pengguna / Guru <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editUserForm.nama}
                onChange={(e) => setEditUserForm({ ...editUserForm, nama: e.target.value })}
                placeholder="Nama Pengguna"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUserForm.username}
                  onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                  placeholder="Contoh: guru6a"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUserForm.password}
                  onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                  placeholder="Password akun"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                NIP (Nomor Induk Pegawai)
              </label>
              <input
                type="text"
                value={editUserForm.nip}
                onChange={(e) => setEditUserForm({ ...editUserForm, nip: e.target.value })}
                placeholder="Contoh: 19820514 200801 2 007"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Simpan Akun
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
