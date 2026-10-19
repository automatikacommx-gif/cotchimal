import React, { useState, useEffect } from 'react';
import { WorkshopMachine } from '../../types';
import { settingsService, DEFAULT_PRESET_MACHINES } from '../../services/settingsService';
import { 
  Printer, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Sparkles, 
  X, 
  Search, 
  Sliders, 
  Copy, 
  CheckCircle2, 
  RefreshCw,
  Layers,
  Maximize2
} from 'lucide-react';

interface MachinesViewProps {
  onShowToast: (toast: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

export const MachinesView: React.FC<MachinesViewProps> = ({ onShowToast }) => {
  const [machines, setMachines] = useState<WorkshopMachine[]>(() => settingsService.getCachedConfig().machines);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewMachine, setIsNewMachine] = useState(true);
  const [editingMachine, setEditingMachine] = useState<WorkshopMachine | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'offset' | 'digital' | 'gran_formato'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPresetsDropdown, setShowPresetsDropdown] = useState(false);

  useEffect(() => {
    let isMounted = true;
    settingsService.getConfig().then((cfg) => {
      if (isMounted) {
        setMachines(cfg.machines);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: string) => {
    const updated = machines.filter((m) => m.id !== id);
    setMachines(updated);
    await settingsService.updateMachines(updated);
    onShowToast({ type: 'info', message: 'Máquina eliminada del taller' });
  };

  const handleToggleActive = async (id: string) => {
    const updated = machines.map((m) =>
      m.id === id ? { ...m, is_active: !m.is_active } : m
    );
    setMachines(updated);
    await settingsService.updateMachines(updated);
    onShowToast({ type: 'success', message: 'Estado de máquina actualizado' });
  };

  const handleSaveMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMachine) return;

    if (!editingMachine.name.trim()) {
      onShowToast({ type: 'error', message: 'El nombre de la máquina es obligatorio' });
      return;
    }

    let updated: WorkshopMachine[];
    if (machines.some((m) => m.id === editingMachine.id)) {
      updated = machines.map((m) => (m.id === editingMachine.id ? editingMachine : m));
    } else {
      updated = [...machines, editingMachine];
    }

    setMachines(updated);
    await settingsService.updateMachines(updated);
    setIsModalOpen(false);
    setEditingMachine(null);
    onShowToast({
      type: 'success',
      message: isNewMachine ? 'Nueva máquina registrada y sincronizada' : 'Máquina actualizada exitosamente',
    });
  };

  const handleOpenNew = () => {
    setIsNewMachine(true);
    setEditingMachine({
      id: `m-${Date.now()}`,
      name: '',
      sheet_size: '71×102 cm',
      plate_price: 80,
      print_price_type: 'fijo',
      print_price: 80,
      waste_ranges: '5 rangos · desde 100 plgs',
      is_active: true,
      machine_type: 'offset',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: WorkshopMachine) => {
    setIsNewMachine(false);
    setEditingMachine({ ...m });
    setIsModalOpen(true);
  };

  const handleImportPreset = async (preset: Omit<WorkshopMachine, 'id'>) => {
    const newMachine: WorkshopMachine = {
      ...preset,
      id: `m-${Date.now()}`,
    };
    const updated = [...machines, newMachine];
    setMachines(updated);
    await settingsService.updateMachines(updated);
    setShowPresetsDropdown(false);
    onShowToast({ type: 'success', message: `Máquina ${preset.name} agregada al taller` });
  };

  const filteredMachines = machines.filter((m) => {
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'offset' && (!m.machine_type || m.machine_type === 'offset')) ||
      m.machine_type === filterType;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sheet_size.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#262422] font-heading">
              Máquinas de Impresión
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#10B981] border border-emerald-200 text-[11px] font-extrabold uppercase tracking-wide">
              {machines.filter((m) => m.is_active).length} Activas
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Equipos offset, prensas digitales y plotters de gran formato configurados en tu taller
          </p>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            type="button"
            onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#10B981]" />
            <span className="hidden sm:inline">Plantillas</span>
          </button>

          {showPresetsDropdown && (
            <div className="absolute right-0 top-12 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 w-72 max-h-80 overflow-y-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1.5 block">
                Máquinas preconfiguradas
              </span>
              {DEFAULT_PRESET_MACHINES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleImportPreset(preset)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-all flex flex-col gap-0.5 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{preset.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      {preset.machine_type || 'offset'}
                    </span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-400">
                    {preset.sheet_size} · ${preset.print_price}
                  </span>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Máquina</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'offset', label: 'Offset' },
            { id: 'digital', label: 'Digital' },
            { id: 'gran_formato', label: 'Gran Formato' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar máquina..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#10B981]"
          />
        </div>
      </div>

      {/* Grid of Machines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMachines.map((m) => {
          const type = m.machine_type || 'offset';
          return (
            <div
              key={m.id}
              className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between gap-4 ${
                m.is_active
                  ? 'bg-white border-slate-200 shadow-2xs hover:border-[#10B981]'
                  : 'bg-slate-50/70 border-slate-200/60 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      type === 'gran_formato'
                        ? 'bg-purple-100 text-purple-600'
                        : type === 'digital'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-[#DCFCE7] text-[#10B981]'
                    }`}
                  >
                    {type === 'gran_formato' ? (
                      <Maximize2 className="w-6 h-6 stroke-[2]" />
                    ) : type === 'digital' ? (
                      <Layers className="w-6 h-6 stroke-[2]" />
                    ) : (
                      <Printer className="w-6 h-6 stroke-[2]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 leading-tight">
                        {m.name}
                      </h3>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {type}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      Formato: {m.sheet_size}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(m.id)}
                    title={m.is_active ? 'Desactivar máquina' : 'Activar máquina'}
                    className={`p-1.5 rounded-lg text-xs font-black cursor-pointer transition-colors ${
                      m.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {m.is_active ? 'Activa' : 'Inactiva'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(m)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                    title="Editar máquina"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                    title="Eliminar máquina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Specs and rates */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                <div className="p-3 bg-[#FAFBF9] rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    {type === 'digital' ? 'Costo de Preparación' : 'Láminas CMYK'}
                  </span>
                  <span className="text-sm font-black text-slate-900">${m.plate_price}</span>
                </div>
                <div className="p-3 bg-[#FAFBF9] rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    {m.print_price_type === 'metro' ? 'Tiraje por m²' : 'Tiraje x millar'}
                  </span>
                  <span className="text-sm font-black text-slate-900">${m.print_price}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <span className="font-bold text-slate-600">Mermas:</span>
                <span>{m.waste_ranges}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMachines.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center flex flex-col items-center gap-3">
          <Printer className="w-10 h-10 text-slate-300" />
          <h3 className="text-sm font-black text-slate-800">No se encontraron máquinas</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Prueba ajustando el filtro de búsqueda o agrega una nueva máquina de impresión a tu taller.
          </p>
          <button
            type="button"
            onClick={handleOpenNew}
            className="mt-2 px-4 py-2 bg-[#10B981] text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Registrar Máquina
          </button>
        </div>
      )}

      {/* Modal Nueva / Editar Máquina */}
      {isModalOpen && editingMachine && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#262422]">
                  {isNewMachine ? 'Nueva Máquina de Impresión' : 'Editar Máquina'}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Configuración de costos de tiro, láminas y formato
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMachine} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">
                  Nombre de la Máquina
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Canon Océ VarioPrint 6000"
                  value={editingMachine.name}
                  onChange={(e) =>
                    setEditingMachine({ ...editingMachine, name: e.target.value })
                  }
                  className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Tipo de Tecnología
                  </label>
                  <select
                    value={editingMachine.machine_type || 'offset'}
                    onChange={(e) =>
                      setEditingMachine({
                        ...editingMachine,
                        machine_type: e.target.value as any,
                      })
                    }
                    className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800"
                  >
                    <option value="offset">Offset</option>
                    <option value="digital">Digital</option>
                    <option value="gran_formato">Gran Formato</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Formato Máximo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 71×102 cm o 1.60m"
                    value={editingMachine.sheet_size}
                    onChange={(e) =>
                      setEditingMachine({ ...editingMachine, sheet_size: e.target.value })
                    }
                    className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Láminas / Preparación ($)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      required
                      value={editingMachine.plate_price}
                      onChange={(e) =>
                        setEditingMachine({
                          ...editingMachine,
                          plate_price: Number(e.target.value),
                        })
                      }
                      className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-black text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Costo Tiraje ($)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      required
                      value={editingMachine.print_price}
                      onChange={(e) =>
                        setEditingMachine({
                          ...editingMachine,
                          print_price: Number(e.target.value),
                        })
                      }
                      className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-black text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Modalidad de Tiraje
                  </label>
                  <select
                    value={editingMachine.print_price_type}
                    onChange={(e) =>
                      setEditingMachine({
                        ...editingMachine,
                        print_price_type: e.target.value as any,
                      })
                    }
                    className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800"
                  >
                    <option value="fijo">Fijo por millar</option>
                    <option value="escala">Escala por volumen</option>
                    <option value="metro">Por metro cuadrado</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Mermas de Arranque
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 4 rangos · desde 100 plgs"
                    value={editingMachine.waste_ranges}
                    onChange={(e) =>
                      setEditingMachine({ ...editingMachine, waste_ranges: e.target.value })
                    }
                    className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="machine_active_checkbox"
                  checked={editingMachine.is_active}
                  onChange={(e) =>
                    setEditingMachine({ ...editingMachine, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-[#10B981] rounded border-slate-300 focus:ring-[#10B981]"
                />
                <label
                  htmlFor="machine_active_checkbox"
                  className="text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Máquina activa disponible para cotizar
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-black text-white shadow-xs cursor-pointer transition-all"
                >
                  {isNewMachine ? 'Registrar Máquina' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
