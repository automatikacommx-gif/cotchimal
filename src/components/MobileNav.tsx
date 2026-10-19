import React from 'react';
import { NavTab } from './Sidebar';
import { LayoutDashboard, Calculator, LayoutGrid, Users, CheckSquare, Settings } from 'lucide-react';

interface MobileNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'resumen' as NavTab, label: 'Resumen', icon: LayoutDashboard },
    { id: 'cotizar' as NavTab, label: 'Cotizar', icon: Calculator },
    { id: 'imposicion' as NavTab, label: 'Imposición', icon: LayoutGrid },
    { id: 'clientes' as NavTab, label: 'Clientes', icon: Users },
    { id: 'gestion' as NavTab, label: 'Gestión', icon: CheckSquare },
  ];

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-[#1E5D36] shadow-[0_-4px_20px_rgba(15,81,50,0.15)] flex items-center justify-around pb-safe"
      style={{ backgroundColor: '#1E5D36' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all ${
              isActive ? 'bg-[#D9531E] text-white font-bold' : 'text-white/80 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 text-white" />
            <span className="text-[10px] uppercase font-bold tracking-wider leading-none text-white">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
