import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface AlertProps {
  type?: 'error' | 'success' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'error', message, onClose }) => {
  const styles = {
    error: {
      bg: 'bg-red-950/50 border-red-500/40 text-red-200',
      icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-950/50 border-amber-500/40 text-amber-200',
      icon: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    info: {
      bg: 'bg-indigo-950/50 border-indigo-500/40 text-indigo-200',
      icon: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
    },
  }[type];

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-1 duration-200 ${styles.bg}`}
      role="alert"
    >
      {styles.icon}
      <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-0.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
