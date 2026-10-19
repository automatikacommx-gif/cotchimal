import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Login } from './Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onOpenSupabaseConfig?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onOpenSupabaseConfig,
}) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#0F5132] text-white flex items-center justify-center shadow-xl mb-4 animate-bounce">
          <svg
            className="w-7 h-7 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
        <h3 className="text-base font-black text-slate-800">
          Verificando sesión en Supabase...
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Editorial Jiménez · Control de acceso protegido
        </p>
      </div>
    );
  }

  // Si no hay usuario ni perfil autenticado, renderizar la pantalla de Login obligatoria
  if (!user && !profile) {
    return <Login onOpenSupabaseConfig={onOpenSupabaseConfig} />;
  }

  // Usuario autenticado con sesión válida
  return <>{children}</>;
};
