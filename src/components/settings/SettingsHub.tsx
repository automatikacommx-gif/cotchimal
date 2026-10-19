import React, { useState, useEffect } from 'react';
import { CompanyWizard } from './onboarding/CompanyWizard';
import { TarifarioView } from './TarifarioView';
import { MachinesView } from './MachinesView';
import { PapersView } from './PapersView';
import { TeamView } from './TeamView';
import { SupabaseConfigModal } from '../SupabaseConfigModal';
import { ToastNotification } from '../../types';
import { 
  Building2, 
  Calculator, 
  Printer, 
  FileText, 
  Users, 
  Database
} from 'lucide-react';

export type SettingsSubMenu = 'empresa' | 'tarifario' | 'maquinas' | 'papeles' | 'equipo';

interface SettingsHubProps {
  onGoToQuote: () => void;
  onGoToClients?: () => void;
  clientsCount?: number;
  onShowToast: (toast: Omit<ToastNotification, 'id'>) => void;
  initialWizardStep?: number;
  initialStep3SubStep?: 1 | 2;
  wizardNavTrigger?: number;
}

export const SettingsHub: React.FC<SettingsHubProps> = ({
  onGoToQuote,
  onGoToClients,
  clientsCount = 0,
  onShowToast,
  initialWizardStep = 1,
  initialStep3SubStep = 1,
  wizardNavTrigger = 0,
}) => {
  const [activeSubMenu, setActiveSubMenu] = useState<SettingsSubMenu>('empresa');
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  useEffect(() => {
    if (wizardNavTrigger > 0) {
      setActiveSubMenu('empresa');
    }
  }, [wizardNavTrigger]);

  const subMenus = [
    {
      id: 'empresa' as SettingsSubMenu,
      letter: 'A',
      title: 'Empresa',
      subtitle: 'Configuración en 5 pasos',
      icon: Building2,
    },
    {
      id: 'tarifario' as SettingsSubMenu,
      letter: 'B',
      title: 'Tarifario',
      subtitle: 'Fórmulas y precios base',
      icon: Calculator,
    },
    {
      id: 'maquinas' as SettingsSubMenu,
      letter: 'C',
      title: 'MÁQUINAS',
      subtitle: 'Máquinas y costos de tiraje',
      icon: Printer,
    },
    {
      id: 'papeles' as SettingsSubMenu,
      letter: 'D',
      title: 'Papeles',
      subtitle: 'Gramajes y sustratos',
      icon: FileText,
    },
    {
      id: 'equipo' as SettingsSubMenu,
      letter: 'E',
      title: 'Equipo',
      subtitle: 'Usuarios y roles',
      icon: Users,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Submenu Pills Navigation Header */}
      <div className="w-full bg-white border border-[#DEE4DF] rounded-2xl p-2 sm:p-3 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {subMenus.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubMenu === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSubMenu(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0F5132] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#EFF5F0]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#EFF5F0] text-[#0F5132]'
                  }`}
                >
                  {item.letter}
                </span>
                <Icon className="w-4 h-4" />
                <span className="uppercase tracking-tight">{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Botón rápido Base de Datos Supabase */}
        <button
          type="button"
          onClick={() => setIsDbModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#DEE4DF] hover:border-slate-300 text-xs font-bold text-slate-600 hover:text-slate-900 bg-[#F8FAF8] whitespace-nowrap cursor-pointer shrink-0 transition-colors"
          title="Ver o configurar conexión a PostgreSQL en Supabase"
        >
          <Database className="w-3.5 h-3.5 text-[#198754]" />
          <span className="hidden md:inline">Base de Datos & SQL</span>
        </button>
      </div>

      {/* Main Submenu Content */}
      <div className="w-full">
        {activeSubMenu === 'empresa' && (
          <CompanyWizard
            onGoToQuote={onGoToQuote}
            onGoToClients={onGoToClients}
            clientsCount={clientsCount}
            onShowToast={onShowToast}
            initialStep={initialWizardStep}
            initialStep3SubStep={initialStep3SubStep}
            navTrigger={wizardNavTrigger}
          />
        )}

        {activeSubMenu === 'tarifario' && (
          <TarifarioView
            onShowToast={(toast) => onShowToast({ ...toast, description: '' })}
          />
        )}

        {activeSubMenu === 'maquinas' && (
          <MachinesView
            onShowToast={(toast) => onShowToast({ ...toast, description: '' })}
          />
        )}

        {activeSubMenu === 'papeles' && (
          <PapersView
            onShowToast={(toast) => onShowToast({ ...toast, description: '' })}
          />
        )}

        {activeSubMenu === 'equipo' && (
          <TeamView
            onShowToast={(toast) => onShowToast({ ...toast, description: '' })}
          />
        )}
      </div>

      {/* Supabase Connection & SQL Migration Modal */}
      <SupabaseConfigModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onShowNotification={(msg, type) =>
          onShowToast({
            type,
            message: msg,
          })
        }
      />
    </div>
  );
};
