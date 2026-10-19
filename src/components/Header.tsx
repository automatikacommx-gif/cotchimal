import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, subscribeToTablesStatus } from '../lib/supabase';
import { 
  Search, 
  Bell, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  User as UserIcon, 
  ShieldCheck, 
  Briefcase,
  LogOut,
  Key,
  Settings,
  Sliders
} from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenSupabaseConfig: () => void;
  onOpenSettings?: () => void;
  onOpenConfigSummary?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onQuickQuote: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenSupabaseConfig,
  onOpenSettings,
  onOpenConfigSummary,
  searchQuery,
  onSearchChange,
}) => {
  const { profile, signOut, updateRole } = useAuth();
  const configured = isSupabaseConfigured();
  const [tablesReady, setTablesReady] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnterMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMenuOpen(true);
    // Precarga del módulo en el hover para que al hacer clic la pantalla aparezca en 0ms
    import('./settings/SettingsHub');
  };

  const handleMouseLeaveMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 280);
  };

  useEffect(() => {
    const unsubscribe = subscribeToTablesStatus((ready) => {
      setTablesReady(ready);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-72 h-16 bg-white/90 backdrop-blur-md border-b border-[#E4EAE5] z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-full max-w-xs sm:max-w-sm lg:max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar OP, cotización, cliente o RFC..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAF8] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#D9531E] focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right Actions & Status */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Supabase Connection Status Pill */}
        <button
          onClick={onOpenSupabaseConfig}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            configured
              ? tablesReady === false
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 animate-pulse'
          }`}
          title={
            tablesReady === false
              ? 'Supabase conectado pero tablas pendientes. Haz clic para copiar el script SQL de migración.'
              : 'Ver estado de conexión Supabase'
          }
        >
          <Database className="w-3.5 h-3.5" />
          <span>
            {!configured
              ? 'Configurar Supabase'
              : tablesReady === false
              ? 'Supabase · Tablas Pendientes'
              : 'Supabase Conectado'}
          </span>
          {!configured ? (
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          ) : tablesReady === false ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          )}
        </button>

        {/* Notifications Icon */}
        <button
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Notificaciones comerciales"
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* User Profile & Role Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
              {profile?.full_name || 'Ing. Carlos Mendez'}
            </span>
            <div className="flex items-center justify-end gap-1.5 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1 font-semibold text-[#0F5132]">
                {profile?.role === 'admin' ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-[#198754]" /> Admin
                  </>
                ) : (
                  <>
                    <Briefcase className="w-3 h-3 text-blue-600" /> Vendedor
                  </>
                )}
              </span>
              <span>• Preprensa</span>
            </div>
          </div>

          {/* Botón de Usuario Verde Pequeño: "Opciones de cuenta" */}
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnterMenu}
            onMouseLeave={handleMouseLeaveMenu}
          >
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="w-9 h-9 rounded-xl bg-[#0F5132] text-white flex items-center justify-center hover:bg-[#107C41] transition-colors shadow-sm cursor-pointer"
              title="Opciones de cuenta"
              aria-label="Opciones de cuenta"
            >
              <UserIcon className="w-4 h-4" />
            </button>

            {/* Menú Desplegable "Opciones de cuenta" con puente continuo de hover */}
            {menuOpen && (
              <div className="absolute right-0 top-full pt-2 z-50">
                <div className="w-60 bg-white border border-[#DEE4DF] rounded-2xl shadow-xl p-2 animate-in fade-in duration-150">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {profile?.full_name || 'Usuario'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{profile?.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#D1E7DD] text-[#0F5132]">
                      Rol actual: {profile?.role?.toUpperCase() || 'ADMIN'}
                    </span>
                  </div>

                  {/* Botón de Ajustes integrado dentro de Opciones de cuenta */}
                  {onOpenSettings && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full text-left px-3 py-2.5 text-xs font-bold text-[#0F5132] bg-[#EFF5F0]/70 hover:bg-[#D1E7DD]/70 rounded-xl flex items-center justify-between transition-colors mb-1 cursor-pointer"
                    >
                      <span>Ajustes</span>
                      <Settings className="w-4 h-4 text-[#198754]" />
                    </button>
                  )}

                  {onOpenConfigSummary && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenConfigSummary();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Resumen de configuración</span>
                      <Sliders className="w-3.5 h-3.5 text-[#198754]" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Perfil y cuenta</span>
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Toggle Role */}
                  <button
                    type="button"
                    onClick={() => {
                      updateRole(profile?.role === 'admin' ? 'seller' : 'admin');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Alternar a {profile?.role === 'admin' ? 'Vendedor' : 'Admin'}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenSupabaseConfig();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Configuración Supabase</span>
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-between transition-colors mt-1 border-t border-slate-100 cursor-pointer"
                  >
                    <span>Cerrar sesión</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
