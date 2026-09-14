import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-slate-900 text-white';
        let Icon = Info;

        if (toast.type === 'success') {
          bg = 'bg-emerald-600 text-white shadow-emerald-900/20';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bg = 'bg-rose-600 text-white shadow-rose-900/20';
          Icon = AlertCircle;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-600 text-white shadow-amber-900/20';
          Icon = AlertTriangle;
        } else {
          bg = 'bg-blue-700 text-white shadow-blue-900/20';
          Icon = Info;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg transition-all duration-200 border border-white/10 ${bg}`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-white/80 hover:text-white rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
