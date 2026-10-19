import React, { useState } from 'react';
import { WorkshopMachine, CompanySettings, PriceScaleRange, PricingMode, WasteRange } from '../../../types';
import { DEFAULT_PRICE_SCALES, DEFAULT_WASTE_RANGES, settingsService } from '../../../services/settingsService';
import {
  Printer,
  Check,
  Hash,
  CircleDollarSign,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Scissors,
} from 'lucide-react';

interface Step3MachinesPart2Props {
  machines: WorkshopMachine[];
  company: CompanySettings;
  onUpdateMachines: (machines: WorkshopMachine[]) => void;
  onUpdateCompany: (company: Partial<CompanySettings>) => void;
  onOpenAddModal: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step3MachinesPart2: React.FC<Step3MachinesPart2Props> = ({
  machines,
  company,
  onUpdateMachines,
  onUpdateCompany,
  onOpenAddModal,
  onPrev,
  onNext,
}) => {
  const [savedMachineId, setSavedMachineId] = useState<string | null>(null);
  const [expandedWasteMachineId, setExpandedWasteMachineId] = useState<string | null>(null);

  const handleUpdateMachinePricing = (id: string, updates: Partial<WorkshopMachine>) => {
    const updated = machines.map((m) => (m.id === id ? { ...m, ...updates } : m));
    onUpdateMachines(updated);
  };

  const handleTogglePricingMode = (machineId: string, mode: PricingMode) => {
    handleUpdateMachinePricing(machineId, {
      pricing_mode: mode,
      print_price_type: mode === 'fixed' ? 'fijo' : 'escala',
    });
  };

  const handleUpdateScale = (machineId: string, index: number, updates: Partial<PriceScaleRange>) => {
    const target = machines.find((m) => m.id === machineId);
    if (!target) return;
    const existing = target.price_scales && target.price_scales.length > 0
      ? target.price_scales
      : [...DEFAULT_PRICE_SCALES];
    const updated = existing.map((scale, i) => (i === index ? { ...scale, ...updates } : scale));
    handleUpdateMachinePricing(machineId, { price_scales: updated });
  };

  const handleAddScaleRange = (machineId: string) => {
    const target = machines.find((m) => m.id === machineId);
    if (!target) return;
    const existing = target.price_scales && target.price_scales.length > 0
      ? target.price_scales
      : [...DEFAULT_PRICE_SCALES];
    const last = existing[existing.length - 1];
    const newFrom = last && last.to_sheets ? last.to_sheets + 1 : 5001;
    const newScale: PriceScaleRange = {
      from_sheets: newFrom,
      to_sheets: newFrom + 5000,
      price_per_unit: last ? Math.max(10, last.price_per_unit - 5) : 30,
    };
    handleUpdateMachinePricing(machineId, { price_scales: [...existing, newScale] });
  };

  const handleRemoveScaleRange = (machineId: string, index: number) => {
    const target = machines.find((m) => m.id === machineId);
    if (!target) return;
    const existing = target.price_scales && target.price_scales.length > 0
      ? target.price_scales
      : [...DEFAULT_PRICE_SCALES];
    if (existing.length <= 1) return;
    const updated = existing.filter((_, i) => i !== index);
    handleUpdateMachinePricing(machineId, { price_scales: updated });
  };

  const handleUpdateWasteRange = (machineId: string, rangeId: string, updates: Partial<WasteRange>) => {
    const target = machines.find((m) => m.id === machineId);
    if (!target) return;
    const existing = target.waste_scales && target.waste_scales.length > 0
      ? target.waste_scales
      : [...DEFAULT_WASTE_RANGES];
    const updated = existing.map((r) => {
      if (r.id === rangeId) {
        return { ...r, ...updates };
      }
      return r;
    });
    handleUpdateMachinePricing(machineId, {
      waste_scales: updated,
      waste_ranges: `${updated.length} rangos · desde ${updated[0]?.from_sheets ?? 100} plgs`,
    });
  };

  const handleRemoveWasteRange = (machineId: string, rangeId: string) => {
    const target = machines.find((m) => m.id === machineId);
    if (!target) return;
    const existing = target.waste_scales && target.waste_scales.length > 0
      ? target.waste_scales
      : [...DEFAULT_WASTE_RANGES];
    if (existing.length <= 1) return;
    const updated = existing.filter((r) => r.id !== rangeId);
    handleUpdateMachinePricing(machineId, {
      waste_scales: updated,
      waste_ranges: `${updated.length} rangos · desde ${updated[0]?.from_sheets ?? 100} plgs`,
    });
  };

  const handleSaveMachinePricingClick = async (machineId: string) => {
    setSavedMachineId(machineId);
    const target = machines.find((m) => m.id === machineId);
    if (target) {
      await settingsService.saveSingleMachine(target);
    }
    setTimeout(() => {
      setSavedMachineId(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header de la Parte 2 */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-widest text-[#10B981] uppercase">
          PASO 3 DE 5
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#262422] tracking-tight font-heading">
          Enciende tu motor
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Confirma los precios base de cada máquina. Son el corazón de tu cotizador.
        </p>
      </div>

      {/* Mensaje si no tiene máquinas aún */}
      {machines.length === 0 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="text-xs text-amber-800 font-medium">
            No tienes prensas agregadas aún. Puedes continuar configurando las tarifas de corte o regresar a agregar tus máquinas.
          </div>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100 shrink-0 cursor-pointer"
          >
            + Agregar máquina ahora
          </button>
        </div>
      )}

      {/* Lista de tarjetas de máquinas */}
      {[...machines].sort((a, b) => a.name.localeCompare(b.name)).map((machine, machineIdx) => {
        const pricingMode: PricingMode = machine.pricing_mode || 'fixed';
        const platePrice = machine.plate_price !== undefined ? machine.plate_price : 80;
        const printFixedPrice = machine.print_price_fixed ?? machine.print_price ?? 80;
        const scales = machine.price_scales && machine.price_scales.length > 0
          ? machine.price_scales
          : [...DEFAULT_PRICE_SCALES];
        const wasteScales = machine.waste_scales && machine.waste_scales.length > 0
          ? machine.waste_scales
          : [...DEFAULT_WASTE_RANGES];
        const isSaved = savedMachineId === machine.id;
        const isWasteExpanded = expandedWasteMachineId === machine.id || (expandedWasteMachineId === null && machineIdx === 0);

        return (
          <div
            key={machine.id}
            className="bg-[#F5EFE6]/60 border border-[#E5E0D5] rounded-3xl p-5 sm:p-6 flex flex-col gap-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2 truncate">
                <h3 className="text-base sm:text-lg font-black text-[#262422] truncate">
                  {machine.name}
                </h3>
                <span className="text-xs font-bold text-slate-500 shrink-0">
                  {machine.useful_width_cm && machine.useful_height_cm
                    ? `${machine.useful_width_cm}×${machine.useful_height_cm} cm`
                    : machine.sheet_size}
                </span>
              </div>
            </div>

            {/* 1. LÁMINAS (CMYK) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <CircleDollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span>LÁMINAS (CMYK)</span>
              </label>
              <div className="flex items-center bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl px-3 py-2 shadow-2xs w-full max-w-sm">
                <span className="text-sm font-bold text-slate-500 mr-2">$</span>
                <input
                  type="number"
                  min="0"
                  value={platePrice}
                  onChange={(e) =>
                    handleUpdateMachinePricing(machine.id, {
                      plate_price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full text-sm font-bold text-slate-800 outline-none bg-transparent"
                />
                <span className="text-xs font-bold text-slate-400 shrink-0">/lámina</span>
              </div>
            </div>

            {/* 2. IMPRESIÓN */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <CircleDollarSign className="w-3.5 h-3.5 text-slate-500" />
                  <span>IMPRESIÓN</span>
                </label>

                <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#DDD7CD] shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleTogglePricingMode(machine.id, 'fixed')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pricingMode === 'fixed'
                        ? 'bg-white text-slate-800 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Precio fijo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTogglePricingMode(machine.id, 'scale')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pricingMode === 'scale'
                        ? 'bg-white text-slate-800 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Por escala
                  </button>
                </div>
              </div>

              {pricingMode === 'fixed' ? (
                <div className="flex items-center bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl px-3 py-2 shadow-2xs w-full max-w-sm">
                  <span className="text-sm font-bold text-slate-500 mr-2">$</span>
                  <input
                    type="number"
                    min="0"
                    value={printFixedPrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      handleUpdateMachinePricing(machine.id, {
                        print_price: val,
                        print_price_fixed: val,
                      });
                    }}
                    className="w-full text-sm font-bold text-slate-800 outline-none bg-transparent"
                  />
                  <span className="text-xs font-bold text-slate-400 shrink-0">/millar</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#DDD7CD]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Rangos de tiraje y precio por millar
                  </span>

                  <div className="flex flex-col gap-2">
                    {scales.map((scale, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 bg-white border border-[#DDD7CD] px-2.5 py-1.5 rounded-xl shadow-2xs">
                          <span className="text-slate-400 font-medium">De</span>
                          <input
                            type="number"
                            value={scale.from_sheets}
                            onChange={(e) =>
                              handleUpdateScale(machine.id, idx, {
                                from_sheets: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-14 font-bold text-slate-800 outline-none text-right"
                          />
                          <span className="text-slate-400 font-medium">a</span>
                          <input
                            type="number"
                            placeholder="∞"
                            value={scale.to_sheets ?? ''}
                            onChange={(e) =>
                              handleUpdateScale(machine.id, idx, {
                                to_sheets: e.target.value ? parseInt(e.target.value) : undefined,
                              })
                            }
                            className="w-14 font-bold text-slate-800 outline-none text-right"
                          />
                          <span className="text-slate-400">plgs</span>
                        </div>

                        <div className="flex items-center gap-1 bg-white border border-[#DDD7CD] px-2.5 py-1.5 rounded-xl shadow-2xs">
                          <span className="text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            value={scale.price_per_unit}
                            onChange={(e) =>
                              handleUpdateScale(machine.id, idx, {
                                price_per_unit: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-14 font-bold text-slate-800 outline-none text-right"
                          />
                          <span className="text-slate-400 font-medium">/millar</span>
                        </div>

                        {scales.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveScaleRange(machine.id, idx)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddScaleRange(machine.id)}
                    className="self-start mt-1 text-xs font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Agregar rango de escala</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. MERMAS DE ARRANQUE Y TIRO */}
            <div className="flex flex-col gap-2 pt-1 border-t border-[#E5E0D5]/70">
              <button
                type="button"
                onClick={() =>
                  setExpandedWasteMachineId(isWasteExpanded ? '' : machine.id)
                }
                className="flex items-center justify-between text-left py-1 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    MERMAS DE ARRANQUE Y TIRO
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    ({wasteScales.length} rangos configurados)
                  </span>
                </div>
                {isWasteExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                )}
              </button>

              {isWasteExpanded && (
                <div className="flex flex-col gap-2 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#DDD7CD] animate-in fade-in duration-150">
                  <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-1">
                    <span className="col-span-5">Tiraje (pliegos)</span>
                    <span className="col-span-3 text-right">Arranque (plgs)</span>
                    <span className="col-span-3 text-right">Tiro (%)</span>
                    <span className="col-span-1"></span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {wasteScales.map((wasteRange) => (
                      <div
                        key={wasteRange.id}
                        className="grid grid-cols-12 items-center gap-1.5 bg-white border border-[#DDD7CD] px-2.5 py-1.5 rounded-xl text-xs shadow-2xs"
                      >
                        <div className="col-span-5 flex items-center gap-1">
                          <input
                            type="number"
                            value={wasteRange.from_sheets}
                            onChange={(e) =>
                              handleUpdateWasteRange(machine.id, wasteRange.id, {
                                from_sheets: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-12 font-bold text-slate-800 outline-none text-right bg-transparent"
                          />
                          <span className="text-slate-400">-</span>
                          <input
                            type="number"
                            placeholder="∞"
                            value={wasteRange.to_sheets ?? ''}
                            onChange={(e) =>
                              handleUpdateWasteRange(machine.id, wasteRange.id, {
                                to_sheets: e.target.value ? parseInt(e.target.value) : undefined,
                              })
                            }
                            className="w-12 font-bold text-slate-800 outline-none text-right bg-transparent"
                          />
                          <span className="text-[10px] text-slate-400">plgs</span>
                        </div>

                        <div className="col-span-3 flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={wasteRange.setup_sheets}
                            onChange={(e) =>
                              handleUpdateWasteRange(machine.id, wasteRange.id, {
                                setup_sheets: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-10 font-bold text-slate-800 outline-none text-right bg-transparent"
                          />
                          <span className="text-[10px] text-slate-400">plgs</span>
                        </div>

                        <div className="col-span-3 flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="0.5"
                            value={wasteRange.run_percent}
                            onChange={(e) =>
                              handleUpdateWasteRange(machine.id, wasteRange.id, {
                                run_percent: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-10 font-bold text-slate-800 outline-none text-right bg-transparent"
                          />
                          <span className="text-[10px] text-slate-400">%</span>
                        </div>

                        <div className="col-span-1 flex justify-end">
                          {wasteScales.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveWasteRange(machine.id, wasteRange.id)}
                              className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botón Guardar Máquina */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => handleSaveMachinePricingClick(machine.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  isSaved
                    ? 'bg-[#10B981] text-white'
                    : 'bg-white border border-[#DDD7CD] text-slate-700 hover:border-[#10B981] hover:text-[#10B981]'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>¡Guardado!</span>
                  </>
                ) : (
                  <span>Guardar máquina</span>
                )}
              </button>
            </div>
          </div>
        );
      })}

      {/* SECCIÓN: PARÁMETROS GENERALES DEL TALLER */}
      <div className="bg-[#F8F5F0] border border-[#DDD7CD] rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-slate-600" />
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
            Tarifas generales de guillotina y corte
          </h2>
        </div>

        {/* PARÁMETRO 1: Merma de corte en prensa */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-snug">
                Merma de corte en prensa
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pliegos que se desperdician al escuadrar
              </p>
            </div>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shrink-0 shadow-2xs">
            <input
              type="number"
              step="0.5"
              min="0"
              value={company.press_cut_percent ?? company.waste_margin_percent ?? 5}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                onUpdateCompany({ press_cut_percent: val, waste_margin_percent: val });
              }}
              className="w-12 text-sm font-bold text-slate-800 outline-none text-right mr-1"
            />
            <span className="text-sm font-bold text-slate-500">%</span>
          </div>
        </div>

        {/* PARÁMETRO 2: Corte final - Con step="0.5" EXACTO */}
        <div
          className={`flex items-center justify-between p-4 bg-white rounded-2xl shadow-2xs transition-all ${
            company.final_cut_price <= 0
              ? 'border-2 border-[#EF4444] ring-1 ring-red-400/30'
              : 'border border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                company.final_cut_price <= 0
                  ? 'bg-red-50 text-[#DC2626]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-snug">
                Corte final
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Lo que cobras por cada corte de guillotina
              </p>
            </div>
          </div>

          <div
            className={`flex items-center bg-white rounded-xl px-3 py-1.5 shrink-0 shadow-2xs border transition-all ${
              company.final_cut_price <= 0
                ? 'border-[#EF4444] ring-2 ring-red-400/20'
                : 'border-slate-200'
            }`}
          >
            <span className={`text-sm font-bold mr-1 ${company.final_cut_price <= 0 ? 'text-[#DC2626]' : 'text-slate-500'}`}>$</span>
            <input
              type="number"
              step="0.5"
              min="0"
              value={company.final_cut_price}
              onChange={(e) =>
                onUpdateCompany({ final_cut_price: parseFloat(e.target.value) || 0 })
              }
              className={`w-14 text-sm font-bold outline-none text-right ${
                company.final_cut_price <= 0 ? 'text-[#DC2626]' : 'text-slate-800'
              }`}
            />
          </div>
        </div>

        {/* PARÁMETROS 3 & 4: Radio Button de Modo de Cobro de Corte */}
        <div className="flex flex-col gap-2 pt-1">
          {/* Opción 1: Por corte, por millar */}
          <button
            type="button"
            onClick={() => onUpdateCompany({ final_cut_mode: 'por_corte_millar' })}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
              company.final_cut_mode === 'por_corte_millar'
                ? 'border-[#10B981] bg-[#F0FDF4] shadow-2xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="pt-0.5">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  company.final_cut_mode === 'por_corte_millar'
                    ? 'border-[#10B981] bg-[#10B981]'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {company.final_cut_mode === 'por_corte_millar' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-slate-900">
                  Por corte, por millar
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  de pliegos
                </span>
              </div>
              <span className="text-xs text-[#059669] font-medium mt-0.5">
                lo más común — escala con el tiraje
              </span>
            </div>
          </button>

          {/* Opción 2: Por proyecto */}
          <button
            type="button"
            onClick={() => onUpdateCompany({ final_cut_mode: 'por_proyecto' })}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
              company.final_cut_mode === 'por_proyecto'
                ? 'border-[#10B981] bg-[#F0FDF4] shadow-2xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="pt-0.5">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  company.final_cut_mode === 'por_proyecto'
                    ? 'border-[#10B981] bg-[#10B981]'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {company.final_cut_mode === 'por_proyecto' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900">
                Por proyecto
              </span>
              <span className="text-xs text-slate-400 font-medium mt-0.5">
                un monto fijo, sin importar cuánto sea
              </span>
            </div>
          </button>
        </div>

        {company.final_cut_price <= 0 && (
          <p className="text-xs sm:text-sm text-[#DC2626] font-medium pt-1 animate-in fade-in duration-200">
            Pon cuánto cobras por corte de guillotina — el cotizador lo usa en cada trabajo
          </p>
        )}
      </div>

      {/* Footer de Navegación de la Parte 2 */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200/80">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>← Prensas</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (company.final_cut_price <= 0) {
              return;
            }
            onNext();
          }}
          className={`px-8 py-3.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-sm transition-all ${
            company.final_cut_price > 0
              ? 'bg-[#10B981] hover:bg-[#059669] cursor-pointer active:scale-[0.98]'
              : 'bg-[#10B981]/80 hover:bg-[#10B981] cursor-pointer'
          }`}
        >
          <span>Motor listo · Papeles</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
