import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastContainer } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { DataSiswaView } from './views/DataSiswaView';
import { MataPelajaranView } from './views/MataPelajaranView';
import { InputNilaiView } from './views/InputNilaiView';
import { RekapNilaiView } from './views/RekapNilaiView';
import { UjianSekolahView } from './views/UjianSekolahView';
import { ExcelManagerView } from './views/ExcelManagerView';
import { CetakLaporanView } from './views/CetakLaporanView';
import { PengaturanView } from './views/PengaturanView';

const MainLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If user is not logged in, show Login Screen
  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] font-sans flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Bento Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area on the right */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Bento Top Header */}
        <Navbar
          activeTab={activeTab}
          onNavigate={(tab) => setActiveTab(tab)}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'students' && (
            <DataSiswaView onNavigateToImport={() => setActiveTab('excel')} />
          )}
          {activeTab === 'subjects' && <MataPelajaranView />}
          {activeTab === 'input-grades' && <InputNilaiView />}
          {activeTab === 'recap-grades' && <RekapNilaiView />}
          {activeTab === 'school-exam' && <UjianSekolahView />}
          {(activeTab === 'excel' || activeTab === 'import-excel' || activeTab === 'export-excel') && (
            <ExcelManagerView />
          )}
          {activeTab === 'print-reports' && <CetakLaporanView />}
          {activeTab === 'settings' && <PengaturanView />}
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
