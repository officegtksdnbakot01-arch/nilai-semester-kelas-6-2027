import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  School,
  FileSpreadsheet,
  BarChart3,
  Award,
  Upload,
  Download,
  Printer,
  Settings,
  LogOut,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'subjects'
  | 'rombels'
  | 'input-grades'
  | 'recap-grades'
  | 'school-exam'
  | 'import-excel'
  | 'export-excel'
  | 'print-reports'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen?: boolean;
  isMobileOpen?: boolean;
  onClose?: () => void;
  setIsMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  isMobileOpen,
  onClose,
  setIsMobileOpen,
}) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { settings } = useApp();
  const open = isOpen ?? isMobileOpen ?? false;
  const handleClose = onClose || (() => setIsMobileOpen?.(false));

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      handleClose();
    }
  };

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { id: 'students' as ActiveTab, label: 'Data Siswa', icon: Users, adminOnly: false },
    { id: 'input-grades' as ActiveTab, label: 'Input Nilai', icon: FileSpreadsheet, adminOnly: false },
    { id: 'recap-grades' as ActiveTab, label: 'Rekap Nilai Siswa', icon: BarChart3, adminOnly: false },
    { id: 'school-exam' as ActiveTab, label: 'Ujian Sekolah', icon: Award, adminOnly: false, badge: 'Kelas 6' },
    { id: 'import-excel' as ActiveTab, label: 'Import Excel', icon: Upload, adminOnly: false },
    { id: 'export-excel' as ActiveTab, label: 'Export Excel', icon: Download, adminOnly: false },
    { id: 'print-reports' as ActiveTab, label: 'Cetak SKL', icon: Printer, adminOnly: false, badge: 'F4 & SKL' },
    // Admin Master Data & Configuration
    { id: 'subjects' as ActiveTab, label: 'Mata Pelajaran', icon: BookOpen, adminOnly: true },
    { id: 'rombels' as ActiveTab, label: 'Data Rombel', icon: School, adminOnly: true },
    { id: 'settings' as ActiveTab, label: 'Pengaturan', icon: Settings, adminOnly: true },
  ];

  const logoUrl = settings?.logo_url || 'https://i.ibb.co.com/rRhHc2PD/logo-bakot-01.png';

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#1E3A8A] text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header in Sidebar - Official Logo & School Name */}
        <div className="px-4 py-4 flex items-center gap-3 border-b border-blue-800/60 bg-blue-950/25">
          <div className="w-11 h-11 bg-white/10 rounded-xl p-1 flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
            <img
              src={logoUrl}
              alt="Logo SDN BABELAN KOTA 01"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-white font-extrabold text-sm sm:text-[15px] leading-tight tracking-wide uppercase">
              SDN BABELAN KOTA 01
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-all ${
                  isActive
                    ? 'bg-blue-700/50 text-white font-semibold shadow-xs'
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-200'}`} />
                  <span className="text-left">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-400 text-slate-900">
                    {item.badge}
                  </span>
                )}
                {item.adminOnly && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-blue-950/60 text-blue-200">
                    Admin
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info & User Pill */}
        <div className="p-4 border-t border-blue-800/50 space-y-3">
          <div className="bg-blue-900/50 p-3 rounded-lg flex items-center gap-3 border border-blue-700/40">
            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white shrink-0">
              {currentUser?.rombel ? currentUser.rombel : (currentUser?.role === 'admin' ? 'AD' : 'GK')}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {currentUser?.nama?.split('(')[0]?.trim()}
              </p>
              <p className="text-blue-300 text-[10px] truncate">
                {currentUser?.role === 'admin' ? 'Administrator' : `Guru Rombel ${currentUser?.rombel}`}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-red-300 hover:text-white hover:bg-red-500/15 rounded-md cursor-pointer transition-colors w-full text-xs font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Aplikasi</span>
          </button>
        </div>
      </aside>
    </>
  );
};
