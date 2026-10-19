import React, { useState, useEffect } from 'react';
import { WorkshopMachine, CompanySettings, MachineModel } from '../../../types';
import { MachineConfigForm } from './MachineConfigForm';
import { createWorkshopMachineFromPreset } from '../../../data/machinesData';
import { DEFAULT_PRICE_SCALES, DEFAULT_WASTE_RANGES, PRESET_MACHINE_MODELS } from '../../../services/settingsService';
import { Check } from 'lucide-react';
import { Step3MachinesPart1 } from './Step3MachinesPart1';
import { Step3MachinesPart2 } from './Step3MachinesPart2';

export { Step3MachinesPart1, Step3MachinesPart2 };

interface Step3Props {
  machines: WorkshopMachine[];
  company: CompanySettings;
  onUpdateMachines: (machines: WorkshopMachine[]) => void;
  onUpdateCompany: (company: Partial<CompanySettings>) => void;
  onPrev: () => void;
  onNext: () => void;
  initialSubStep?: 1 | 2;
}

export const Step3Machines: React.FC<Step3Props> = ({
  machines,
  company,
  onUpdateMachines,
  onUpdateCompany,
  onPrev,
  onNext,
  initialSubStep = 1,
}) => {
  // Parte 1 (1 = Prensas / Selección y alta) vs Parte 2 (2 = Enciende tu motor / Precios y Parámetros)
  const [subStep, setSubStep] = useState<1 | 2>(initialSubStep);

  useEffect(() => {
    setSubStep(initialSubStep);
  }, [initialSubStep]);

  // Modal para agregar/editar máquina
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Apertura del modal para nueva máquina
  const handleOpenAddMachineModal = () => {
    setIsEditingExisting(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar parámetros técnicos de una máquina ya agregada
  const handleOpenEdit = (machine: WorkshopMachine) => {
    setIsEditingExisting(true);
    setEditingId(machine.id);
    setIsModalOpen(true);
  };

  const handleToggleActive = (id: string, active: boolean) => {
    const updated = machines.map((m) => (m.id === id ? { ...m, is_active: active } : m));
    onUpdateMachines(updated);
  };

  const handleAddFromPreset = (preset: MachineModel) => {
    const newMachine = createWorkshopMachineFromPreset(preset);
    onUpdateMachines([...machines, newMachine]);
    setSubStep(2);
  };

  // Guardar máquina y transicionar a la pantalla de configuración de parámetros de esa máquina
  const handleSaveMachineFromForm = (machineData: Partial<WorkshopMachine>) => {
    if (isEditingExisting && editingId) {
      const updated = machines.map((m) =>
        m.id === editingId
          ? {
              ...m,
              ...machineData,
            }
          : m
      );
      onUpdateMachines(updated);
    } else {
      const newId = `m-${Date.now()}`;
      const newMachine: WorkshopMachine = {
        id: newId,
        name: machineData.name || '',
        tag: machineData.tag || '',
        max_width_cm: machineData.max_width_cm || 75,
        max_height_cm: machineData.max_height_cm || 53,
        max_calibre_pts: machineData.max_calibre_pts,
        gripper_margin_cm: machineData.gripper_margin_cm ?? 0.5,
        counter_gripper_margin_cm: machineData.counter_gripper_margin_cm ?? 0.5,
        guide_margin_cm: machineData.guide_margin_cm ?? 0.5,
        counter_guide_margin_cm: machineData.counter_guide_margin_cm ?? 0.5,
        useful_width_cm: machineData.useful_width_cm || 74,
        useful_height_cm: machineData.useful_height_cm || 52,
        sheet_size: machineData.sheet_size || `${machineData.max_width_cm}×${machineData.max_height_cm} cm`,
        plate_price: 80,
        pricing_mode: 'fixed',
        print_price_type: 'fijo',
        print_price: 80,
        print_price_fixed: 80,
        price_scales: [...DEFAULT_PRICE_SCALES],
        waste_ranges: '5 rangos · desde 100 plgs',
        waste_scales: [...DEFAULT_WASTE_RANGES],
        is_active: true,
        machine_type: 'offset',
      };
      onUpdateMachines([...machines, newMachine]);
    }
    setIsModalOpen(false);
    setSubStep(2);
  };

  const handleDeleteMachine = (id: string) => {
    onUpdateMachines(machines.filter((m) => m.id !== id));
  };

  const handleParte1Continue = () => {
    setSubStep(2);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#FCFAF6] rounded-3xl p-6 sm:p-10 border border-[#E9E4D9] shadow-sm flex flex-col gap-8">
      {/* Sub-Stepper Tabs (1 Prensas -------- 2 Motor) */}
      <div className="flex items-center justify-between max-w-xs mx-auto w-full relative mb-1">
        <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-slate-200 -translate-y-1/2 -z-0">
          <div
            className={`h-full bg-[#10B981] transition-all duration-300 ${
              subStep === 2 ? 'w-full' : 'w-0'
            }`}
          />
        </div>

        {/* Sub-paso 1: Prensas */}
        <button
          type="button"
          onClick={() => setSubStep(1)}
          className="flex flex-col items-center gap-1.5 z-10 bg-[#FCFAF6] px-2 cursor-pointer"
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              subStep === 1
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'bg-[#10B981] text-white'
            }`}
          >
            {subStep === 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
          </div>
          <span
            className={`text-xs font-bold tracking-tight ${
              subStep === 1 || subStep === 2 ? 'text-[#10B981]' : 'text-slate-500'
            }`}
          >
            Prensas
          </span>
        </button>

        {/* Sub-paso 2: Motor */}
        <button
          type="button"
          onClick={() => setSubStep(2)}
          className="flex flex-col items-center gap-1.5 z-10 bg-[#FCFAF6] px-2 cursor-pointer"
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              subStep === 2
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            2
          </div>
          <span
            className={`text-xs font-bold tracking-tight ${
              subStep === 2 ? 'text-[#10B981]' : 'text-slate-400'
            }`}
          >
            Motor
          </span>
        </button>
      </div>

      {/* PARTE 1 */}
      {subStep === 1 && (
        <Step3MachinesPart1
          machines={machines}
          onOpenAddModal={handleOpenAddMachineModal}
          onToggleActive={handleToggleActive}
          onConfigurePrices={() => {
            setSubStep(2);
          }}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteMachine}
          onAddFromPreset={handleAddFromPreset}
          onPrev={onPrev}
          onNext={handleParte1Continue}
        />
      )}

      {/* PARTE 2 */}
      {subStep === 2 && (
        <Step3MachinesPart2
          machines={machines}
          company={company}
          onUpdateMachines={onUpdateMachines}
          onUpdateCompany={onUpdateCompany}
          onOpenAddModal={handleOpenAddMachineModal}
          onPrev={() => setSubStep(1)}
          onNext={onNext}
        />
      )}

      {/* Modal para agregar / configurar máquina */}
      <MachineConfigForm
        isOpen={isModalOpen}
        initialMachine={isEditingExisting && editingId ? machines.find((m) => m.id === editingId) : null}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMachineFromForm}
      />
    </div>
  );
};
