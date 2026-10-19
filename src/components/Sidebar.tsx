import React from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  LayoutGrid,
  Users, 
  CheckSquare, 
  Settings, 
  CheckCircle,
  PlusCircle
} from 'lucide-react';

export type NavTab = 'resumen' | 'cotizar' | 'imposicion' | 'clientes' | 'gestion' | 'ajustes';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onQuickQuote: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onQuickQuote }) => {
  const navItems = [
    { id: 'resumen' as NavTab, label: 'Resumen', icon: LayoutDashboard },
    { id: 'cotizar' as NavTab, label: 'Cotizar', icon: Calculator },
    { id: 'imposicion' as NavTab, label: 'Imposición', icon: LayoutGrid },
    { id: 'clientes' as NavTab, label: 'Clientes', icon: Users },
    { id: 'gestion' as NavTab, label: 'Gestión', icon: CheckSquare },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-[#EFF5F0] border-r border-[#DEE4DF] z-50 flex-col justify-between py-6">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="px-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F5132] text-white flex items-center justify-center font-bold font-mono text-xl shadow-md">
            GC
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-lg text-[#0F5132] tracking-tight font-heading">
              GRUPO CHIMAL
            </span>
            <span className="text-[11px] text-[#475569] uppercase tracking-wider font-semibold">
              Soluciones Gráficas
            </span>
          </div>
        </div>

        {/* Operational Plant Context */}
        <div className="px-4">
          <div className="p-3 bg-white rounded-xl border border-[#DEE4DF] flex items-center justify-between shadow-[0_1px_6px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Planta Litográfica
              </span>
              <span className="text-xs font-bold text-slate-800">
                Taller Principal CDMX
              </span>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-[#198754] animate-pulse" title="Planta en línea"></span>
          </div>
        </div>

        {/* Primary Action Button: Nueva Cotización Rápida */}
        <div className="px-4">
          <button
            onClick={onQuickQuote}
            className="w-full py-2.5 px-4 rounded-xl bg-[#D9531E] hover:bg-[#C84B15] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Cotización</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#0F5132] text-white shadow-sm'
                    : 'text-[#3E4941] hover:bg-[#E4EAE5] hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Workshop Telemetry */}
      <div className="px-4 flex flex-col gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#DEE4DF] flex flex-col gap-1.5 shadow-[0_1px_6px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">
              Stock Papel Bond
            </span>
            <span className="text-[#198754] font-bold">92%</span>
          </div>
          <div className="w-full bg-[#DEE4DF] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#198754] h-full w-[92%] rounded-full"></div>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 text-slate-500 text-[11px]">
          <span>v2.6.4 Enterprise</span>
          <span className="flex items-center gap-1 text-[#198754] font-semibold">
            <CheckCircle className="w-3 h-3" /> Conectado
          </span>
        </div>
      </div>
    </aside>
  );
};
