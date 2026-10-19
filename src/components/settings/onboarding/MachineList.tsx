import React from 'react';
import { Plus, Check } from 'lucide-react';
import { WorkshopMachine, MachineModel } from '../../../types/machines';
import { MachineCard } from './MachineCard';

interface MachineListProps {
  machines: WorkshopMachine[];
  onOpenAddModal: () => void;
  onToggleActive: (id: string, active: boolean) => void;
  onConfigurePrices: (id: string) => void;
  onEdit: (machine: WorkshopMachine) => void;
  onDelete: (id: string) => void;
  onAddFromPreset?: (preset: MachineModel) => void;
}

export const MachineList: React.FC<MachineListProps> = ({
  machines,
  onOpenAddModal,
  onToggleActive,
  onConfigurePrices,
  onEdit,
  onDelete,
}) => {
  if (machines.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="w-full py-8 px-4 rounded-xl border border-dashed border-[#D1D5DB] flex flex-col items-center justify-center text-center bg-transparent">
          <span className="text-xs sm:text-sm font-medium text-slate-500">
            Aún sin máquinas · Agrégalas ahora o después desde la app
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="w-full py-4 rounded-xl border border-dashed border-[#D1D5DB] text-center font-bold text-sm text-slate-600 hover:border-[#10B981] hover:text-[#10B981] hover:bg-[#F0FDF4] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-inherit" />
          <span>Agregar prensa</span>
        </button>
      </div>
    );
  }

  const sortedMachines = [...machines].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Check className="w-4 h-4 text-[#10B981]" />
          <span>Máquinas en tu taller ({sortedMachines.length})</span>
        </span>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#10B981] text-xs font-bold text-[#10B981] hover:bg-emerald-50/50 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar otra</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {sortedMachines.map((machine) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            onToggleActive={onToggleActive}
            onConfigurePrices={onConfigurePrices}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
