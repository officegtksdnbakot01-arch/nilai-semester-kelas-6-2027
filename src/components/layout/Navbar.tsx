import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { School, User as UserIcon, LogOut, Menu, ChevronDown, Check, Shield } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onToggleMobileMenu?: () => void;
  isSidebarOpen?: boolean;
  activeTab?: string;
  onNavigate?: (tab: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onToggleMobileMenu,
  activeTab = 'dashboard',
  onNavigate,
}) => {
  const { currentUser, logout, loginAs } = useAuth();
  const { settings, users } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggle = onToggleMobileMenu || onToggleSidebar || (() => {});

  const tabTitles: Record<string, string> = {
    dashboard: 'Halaman Utama (Dashboard)',
    students: 'Data Induk Siswa',
    subjects: 'Mata Pelajaran Kurikulum Merdeka',
    'input-grades': 'Input Nilai Rapor Siswa',
    'recap-grades': 'Rekapitulasi Nilai Rapor',
    'school-exam': 'Rekap & Peringkat Ujian Sekolah',
    excel: 'Pusat Manajemen Excel',
    'import-excel': 'Import Data Excel',
    'export-excel': 'Export Data Excel',
    'print-reports': 'Dashboard Cetak Dokumen, Ijazah & SKL',
    settings: 'Pengaturan Sekolah & Bobot',
  };

  const currentTitle = tabTitles[activeTab] || 'Sistem Penilaian Rapor';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shadow-2xs">
      {/* Left: View title & Academic year info */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggle}
          className="p-2 -ml-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors lg:hidden shrink-0 cursor-pointer"
          aria-label="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate leading-tight">
            {currentTitle}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 truncate">
            Tahun Ajaran {settings.tahun_ajaran} • {settings.semester_aktif.includes('2') ? 'Semester 2' : 'Semester 1'} • {settings.nama_sekolah}
          </p>
        </div>
      </div>

      {/* Right: Bento Quick Action Buttons & Profile Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={() => onNavigate?.('excel')}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer"
        >
          <span>📥 IMPORT EXCEL</span>
        </button>

        <button
          onClick={() => onNavigate?.('print-reports')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <span>📤 EXPORT LAPORAN</span>
        </button>

        {/* Profile Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser?.role === 'admin' ? (
                <Shield className="w-4 h-4 text-blue-700" />
              ) : (
                currentUser?.rombel || <UserIcon className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                {currentUser?.nama?.split('(')[0]?.trim() || 'Pengguna'}
              </div>
              <div className="text-[10px] font-semibold text-blue-600 tracking-wide uppercase">
                {currentUser?.role === 'admin' ? 'Administrator' : `Rombel ${currentUser?.rombel}`}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Switcher Dropdown */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Akun Saat Ini
                  </p>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {currentUser?.nama}
                  </p>
                  <p className="text-[11px] text-blue-600 font-medium">
                    {currentUser?.role === 'admin' ? 'Hak Akses Penuh (Admin)' : `Wali Rombel ${currentUser?.rombel}`}
                  </p>
                </div>

                <div className="px-2 py-1.5">
                  <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider my-1">
                    Ganti Cepat Akun (Demo Testing)
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          loginAs(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          currentUser?.id === u.id
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">
                          {u.role === 'admin' ? '👑 ' : '👨‍🏫 '}
                          {u.nama.split('(')[0].trim()}
                        </span>
                        {currentUser?.id === u.id && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 px-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar Aplikasi
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
