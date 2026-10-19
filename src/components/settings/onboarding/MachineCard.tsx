import React, { useState } from 'react';
import {
  Printer,
  Edit2,
  Trash2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Layers,
  Maximize2,
  Check,
} from 'lucide-react';
import { WorkshopMachine } from '../../../types/machines';

interface MachineCardProps {
  machine: WorkshopMachine;
  onToggleActive: (id: string, active: boolean) => void;
  onConfigurePrices: (id: string) => void;
  onEdit: (machine: WorkshopMachine) => void;
  onDelete: (id: string) => void;
}

export const MachineCard: React.FC<MachineCardProps> = ({
  machine,
  onToggleActive,
  onConfigurePrices,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const usefulAreaText =
    machine.useful_width_cm && machine.useful_height_cm
      ? `${machine.useful_width_cm}×${machine.useful_height_cm} cm`
      : `${machine.max_width_cm || 0}×${machine.max_height_cm || 0} cm`;

  const sheetSizeText =
    machine.max_width_cm && machine.max_height_cm
      ? `${machine.max_width_cm}×${machine.max_height_cm} cm`
      : machine.sheet_size || 'Sin definir';

  const isActive = machine.is_active !== false;

  return (
    <div
      className={`p-4 sm:p-5 bg-white border rounded-2xl shadow-2xs transition-all ${
        isActive
          ? 'border-slate-200 hover:border-[#10B981]'
          : 'border-slate-200/60 bg-slate-50/50 opacity-75'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Lado izquierdo: Icono y datos principales */}
        <div className="flex items-start sm:items-center gap-3.5 overflow-hidden">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
              isActive
                ? 'bg-[#E8F8F0] text-[#10B981] border-[#A7F3D0]'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            <Printer className="w-5 h-5" />
          </div>

          <div className="flex flex-col gap-0.5 truncate">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-sm sm:text-base font-black truncate tracking-tight ${
                  isActive ? 'text-[#262422]' : 'text-slate-500 line-through'
                }`}
              >
                {machine.name}
              </h4>
              {machine.tag && (
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                  {machine.tag}
                </span>
              )}
              {machine.technology && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {machine.technology}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap mt-0.5">
              <span>
                Pliego: <strong className="text-slate-700">{sheetSizeText}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Área útil:{' '}
                <strong className={isActive ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                  {usefulAreaText}
                </strong>
              </span>
              {machine.max_calibre_pts !== undefined && machine.max_calibre_pts !== '' && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>
                    Calibre: <strong className="text-slate-700">{machine.max_calibre_pts} pts</strong>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Lado derecho: Acciones y switch activo */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {/* Toggle Activo/Inactivo */}
          <button
            type="button"
            onClick={() => onToggleActive(machine.id, !isActive)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
            title={isActive ? 'Prensa activa en cotizador' : 'Prensa inactiva'}
          >
            <div
              className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#10B981]' : 'bg-slate-400'}`}
            />
            <span>{isActive ? 'Activa' : 'Inactiva'}</span>
          </button>

          {/* Configurar Precios */}
          <button
            type="button"
            onClick={() => onConfigurePrices(machine.id)}
            className="px-3 py-1.5 text-xs font-bold text-[#10B981] hover:bg-emerald-50 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            title="Configurar precios y mermas"
          >
            <span>Precios →</span>
          </button>

          {/* Toggle Detalles técnicos */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Ver márgenes y especificaciones técnicas"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Editar */}
          <button
            type="button"
            onClick={() => onEdit(machine)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Editar parámetros técnicos"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Eliminar */}
          <button
            type="button"
            onClick={() => onDelete(machine.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Eliminar máquina"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vista expandida con márgenes técnicos exactos */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] animate-in fade-in duration-150">
          <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#E9E4D9]">
            <span className="text-slate-400 block font-bold">PINZA</span>
            <span className="font-extrabold text-[#262422]">
              {machine.gripper_margin_cm ?? 1} cm
            </span>
          </div>
          <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#E9E4D9]">
            <span className="text-slate-400 block font-bold">CONTRA-PINZA</span>
            <span className="font-extrabold text-[#262422]">
              {machine.counter_gripper_margin_cm ?? 1} cm
            </span>
          </div>
          <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#E9E4D9]">
            <span className="text-slate-400 block font-bold">ESCUADRA</span>
            <span className="font-extrabold text-[#262422]">
              {machine.guide_margin_cm ?? 0.4} cm
            </span>
          </div>
          <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#E9E4D9]">
            <span className="text-slate-400 block font-bold">CONTRA-ESCUADRA</span>
            <span className="font-extrabold text-[#262422]">
              {machine.counter_guide_margin_cm ?? 0.4} cm
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
