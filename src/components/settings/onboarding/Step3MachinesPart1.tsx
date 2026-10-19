import React from 'react';
import { WorkshopMachine, MachineModel } from '../../../types';
import { MachineList } from './MachineList';

interface Step3MachinesPart1Props {
  machines: WorkshopMachine[];
  onOpenAddModal: () => void;
  onToggleActive: (id: string, active: boolean) => void;
  onConfigurePrices: (id: string) => void;
  onEdit: (machine: WorkshopMachine) => void;
  onDelete: (id: string) => void;
  onAddFromPreset?: (preset: MachineModel) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step3MachinesPart1: React.FC<Step3MachinesPart1Props> = ({
  machines,
  onOpenAddModal,
  onToggleActive,
  onConfigurePrices,
  onEdit,
  onDelete,
  onAddFromPreset,
  onPrev,
  onNext,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header de la Parte 1 */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-widest text-[#10B981] uppercase">
          PASO 3 DE 5
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#262422] tracking-tight font-heading">
          Tus máquinas
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Agrega las máquinas que tienes en tu taller — sin límite. Puedes poner el nombre como quieras.
        </p>
      </div>

      <MachineList
        machines={machines}
        onOpenAddModal={onOpenAddModal}
        onToggleActive={onToggleActive}
        onConfigurePrices={onConfigurePrices}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddFromPreset={onAddFromPreset}
      />

      {/* Footer de Navegación de la Parte 1 */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200/80">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>← Anterior</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-[#10B981] hover:bg-[#059669] flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Confirmar máquinas</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
