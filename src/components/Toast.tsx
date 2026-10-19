import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: number | string;
  message: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose?: (id: number) => void;
  onDismiss?: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onClose, onDismiss }) => {
  if (toasts.length === 0) return null;

  const handleClose = (id: number | string) => {
    if (typeof id === 'number' && onClose) {
      onClose(id);
    } else if (typeof id === 'string' && onDismiss) {
      onDismiss(id);
    } else if (onClose) {
      onClose(Number(id));
    } else if (onDismiss) {
      onDismiss(String(id));
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let bgColor = 'bg-white border-slate-200 text-slate-800';
        let icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;

        if (toast.type === 'success') {
          bgColor = 'bg-[#E8F5E9] border-[#198754]/30 text-[#0F5132]';
          icon = <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0" />;
        } else if (toast.type === 'error') {
          bgColor = 'bg-red-50 border-red-200 text-red-900';
          icon = <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
        } else if (toast.type === 'warning') {
          bgColor = 'bg-amber-50 border-amber-200 text-amber-900';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all transform translate-y-0 ${bgColor}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug">{toast.message}</p>
              {toast.description && (
                <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => handleClose(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const ToastContainer = Toast;
