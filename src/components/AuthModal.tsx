import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Login } from './auth/Login';
import { X, ShieldCheck, CheckCircle2, LogOut } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
  onOpenSupabaseConfig?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onShowNotification,
  onOpenSupabaseConfig,
}) => {
  const { profile, signOut } = useAuth();

  if (!isOpen) return null;

  if (!profile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
        <Login
          isModal={true}
          onClose={onClose}
          onSuccess={() => {
            onShowNotification('Sesión iniciada correctamente', 'success');
            onClose();
          }}
          onOpenSupabaseConfig={onOpenSupabaseConfig}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#F8FAF8] border-b border-slate-200">
          <div>
            <h3 className="text-base font-black text-slate-900 font-heading">
              Perfil de Usuario
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Sesión activa en Supabase Auth
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#198754]/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-black text-[#0F5132]">Sesión Verificada</h4>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                {profile.full_name} ({profile.email})
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D1E7DD] text-[#0F5132]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Rol Asignado: {profile.role === 'admin' ? 'ADMINISTRADOR' : 'VENDEDOR'}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed">
            {profile.role === 'admin' ? (
              <span>
                Acceso completo como <strong>Administrador General</strong> (01luisenrique@gmail.com). Cuentas con permisos totales para gestión de clientes, cotizaciones, configuraciones de imprenta y tarifas.
              </span>
            ) : (
              <span>
                Acceso en modalidad <strong>Vendedor</strong>. Puedes emitir cotizaciones, consultar clientes y dar seguimiento a proyectos comerciales.
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                onShowNotification('Sesión finalizada exitosamente', 'info');
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
