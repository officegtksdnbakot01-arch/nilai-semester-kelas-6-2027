import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { School, LogIn, Lock, User as UserIcon, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

export const LoginView: React.FC = () => {
  const { login, loginAs } = useAuth();
  const { users, settings } = useApp();
  const [username, setUsername] = useState('guru6a');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(username, password);
    if (!success) {
      setError('Nama Pengguna atau Password salah. Silakan coba kembali.');
    }
  };

  const handleQuickLogin = (user: User) => {
    loginAs(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 text-slate-100">
      {/* Decorative background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10 text-center">
        <div className="inline-flex items-center justify-center gap-4 mb-5 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs shadow-xl">
          <div className="w-14 h-14 bg-white/20 rounded-xl p-1.5 flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
            <img
              src={settings.logo_url || "https://i.ibb.co.com/rRhHc2PD/logo-bakot-01.png"}
              alt="Logo SDN BABELAN KOTA 01"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <div className="text-left">
            <span className="block text-white font-black text-lg sm:text-xl tracking-wide uppercase leading-tight">
              SDN BABELAN KOTA 01
            </span>
            <span className="block text-xs font-bold text-white/90 mt-0.5">
              Kec. {settings.kecamatan}, Kab. {settings.kabupaten}
            </span>
          </div>
        </div>
        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">
          APLIKASI NILAI RAPOR & UJIAN SEKOLAH
        </h2>
        <p className="mt-1 text-xs text-blue-200/90 font-medium">
          Tahun Ajaran {settings.tahun_ajaran} • Semester {settings.semester_aktif.includes('2') ? '2' : '1'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-white text-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="border-b border-slate-100 pb-4 mb-2">
              <h3 className="text-lg font-extrabold text-slate-900">Masuk Akun Guru / Admin</h3>
              <p className="text-xs text-slate-500">
                Silakan masukkan username dan password yang diberikan oleh pihak sekolah.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Pengguna / Username
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: guru6a atau admin"
                  className="block w-full pl-10 pr-4 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Aplikasi</span>
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pilih Akun Demo Langsung (1-Klik)
              </span>
              <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                Siap Diuji
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Admin Button */}
              {users
                .filter((u) => u.role === 'admin')
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u)}
                    className="flex items-center justify-between p-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-900 transition-all text-left sm:col-span-2 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{u.nama}</div>
                        <div className="text-[11px] text-blue-700 font-medium">
                          Akses Penuh Seluruh Kelas (4, 5, 6), Mapel & Pengaturan
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}

              {/* Guru Kelas Buttons */}
              {users
                .filter((u) => u.role === 'guru')
                .slice(0, 4)
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-800 transition-all text-left group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {u.nama.split('(')[0].trim()}
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Rombel {u.rombel} (32 Siswa)
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          SDN BABELAN KOTA 01 | Tahun Ajaran 2026/2027
        </p>
      </div>
    </div>
  );
};
