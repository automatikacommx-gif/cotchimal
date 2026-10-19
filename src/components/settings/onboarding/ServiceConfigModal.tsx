import React, { useState, useEffect } from 'react';
import { WorkshopService, PriceUnit, ServiceScaleRange } from '../../../types';
import { 
  X, 
  Check, 
  ChevronDown, 
  DollarSign, 
  Plus,
  Square,
  Layers,
  CheckCircle2,
  FileText,
  LayoutGrid,
  BookOpen,
  Percent,
  CreditCard,
  CircleDot,
  Scissors,
  Camera
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export interface ServiceConfigModalProps {
  isOpen: boolean;
  service: WorkshopService | null;
  onClose: () => void;
  onSave: (updatedService: WorkshopService) => void;
}

export interface UnitOption {
  id: PriceUnit;
  label: string;
  description: string;
  abbr: string;
  icon: React.FC<{ className?: string }>;
}

/**
 * Catálogo exacto de 10 unidades de cobro extraídas literalmente de la Imagen 3 de referencia
 */
export const EXACT_UNIT_OPTIONS: UnitOption[] = [
  {
    id: 'Por pieza',
    label: 'Por pieza',
    description: 'Se cobra por cada pieza del pedido',
    abbr: 'pz',
    icon: Square,
  },
  {
    id: 'Por millar',
    label: 'Por millar',
    description: 'Se cobra por cada 1,000 piezas (se redondea hacia arriba)',
    abbr: 'mill',
    icon: Layers,
  },
  {
    id: 'Por proyecto',
    label: 'Por proyecto',
    description: 'Se cobra una sola vez, sin importar la cantidad',
    abbr: 'proy',
    icon: CheckCircle2,
  },
  {
    id: 'Por pliego',
    label: 'Por pliego',
    description: 'Se cobra por cada pliego que se imprime',
    abbr: 'plg',
    icon: FileText,
  },
  {
    id: 'Por metro cuadrado',
    label: 'Por metro cuadrado',
    description: 'Se cobra por los m² de papel usados en el pedido',
    abbr: 'm²',
    icon: LayoutGrid,
  },
  {
    id: 'Por lado, por millar',
    label: 'Por lado, por millar',
    description: 'Se cobra por cada lado cubierto y por cada 1,000 piezas',
    abbr: 'mill',
    icon: BookOpen,
  },
  {
    id: '% sobre el papel',
    label: '% sobre el papel',
    description: 'Es un porcentaje que se aplica sobre el costo del papel',
    abbr: '%',
    icon: Percent,
  },
  {
    id: 'Por lámina (una vez)',
    label: 'Por lámina (una vez)',
    description: 'Se cobra una vez por color de impresión, no depende de la cantidad',
    abbr: 'lám',
    icon: CreditCard,
  },
  {
    id: 'Por color, por millar',
    label: 'Por color, por millar',
    description: 'Se cobra por cada color y por cada 1,000 piezas',
    abbr: 'mill',
    icon: CircleDot,
  },
  {
    id: 'Por corte, por millar',
    label: 'Por corte, por millar',
    description: 'Se cobra por cada corte de guillotina y por cada 1,000 pliegos',
    abbr: 'mill',
    icon: Scissors,
  },
  {
    id: 'Por toma',
    label: 'Por toma',
    description: 'Se cobra por toma fotográfica realizada',
    abbr: 'toma',
    icon: Camera,
  },
];

export const DEFAULT_SERVICE_SCALES: ServiceScaleRange[] = [
  { id: 'sc-1', from: 1, to: 5, price: 120 },
  { id: 'sc-2', from: 6, to: 15, price: 100 },
  { id: 'sc-3', from: 16, to: null, price: 80 },
];

export const ServiceConfigModal: React.FC<ServiceConfigModalProps> = ({
  isOpen,
  service,
  onClose,
  onSave,
}) => {
  // Estado interno para configuración
  const [selectedUnit, setSelectedUnit] = useState<PriceUnit>('Por metro cuadrado');
  const [pricingMode, setPricingMode] = useState<'fijo' | 'escala'>('fijo');
  const [fixedPrice, setFixedPrice] = useState<string>('2.5');
  const [hasMinimumCharge, setHasMinimumCharge] = useState<boolean>(true);
  const [minimumCharge, setMinimumCharge] = useState<string>('500');
  const [scaleRanges, setScaleRanges] = useState<ServiceScaleRange[]>([...DEFAULT_SERVICE_SCALES]);

  // Sub-modal para selector de unidades (Imagen 3)
  const [isUnitSelectorOpen, setIsUnitSelectorOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Inicializar estado cuando se abre o cambia el servicio seleccionado
  useEffect(() => {
    if (service) {
      // Normalizar unidad existente con una de las opciones exactas
      const rawUnit = service.unit || 'Por metro cuadrado';
      const matchedUnit = EXACT_UNIT_OPTIONS.find(
        (u) =>
          u.label.toLowerCase() === rawUnit.toLowerCase() ||
          u.id.toLowerCase() === rawUnit.toLowerCase() ||
          rawUnit.toLowerCase().includes(u.abbr.toLowerCase())
      );
      setSelectedUnit(matchedUnit ? matchedUnit.id : 'Por metro cuadrado');

      const mode = service.pricing_mode || (service.rate_mode === 'Por escala' ? 'escala' : 'fijo');
      setPricingMode(mode);

      setFixedPrice(service.price !== undefined ? String(service.price) : '2.5');

      // "¿Tiene un mínimo a cobrar?" debe estar SIEMPRE ACTIVA por defecto al abrir la ventana modal
      const hasMin = service.has_minimum_charge !== undefined
        ? Boolean(service.has_minimum_charge)
        : true;
      setHasMinimumCharge(hasMin);
      setMinimumCharge(
        service.min_price && service.min_price > 0 ? String(service.min_price) : '500'
      );

      if (service.price_scales && service.price_scales.length > 0) {
        setScaleRanges(service.price_scales);
      } else {
        setScaleRanges([...DEFAULT_SERVICE_SCALES]);
      }
    }
  }, [service, isOpen]);

  if (!isOpen || !service) return null;

  const currentUnitOption =
    EXACT_UNIT_OPTIONS.find((u) => u.id === selectedUnit) || EXACT_UNIT_OPTIONS[4]; // Default: 'Por metro cuadrado'

  const SelectedUnitIcon = currentUnitOption.icon;

  // Lógica para agregar un nuevo rango dinámico
  const handleAddScaleRange = () => {
    const lastRange = scaleRanges[scaleRanges.length - 1];
    const newFrom = lastRange
      ? (lastRange.to !== null ? lastRange.to + 1 : lastRange.from + 10)
      : 1;
    const newPrice = lastRange ? Math.max(10, Math.round(lastRange.price * 0.85)) : 50;

    const newRange: ServiceScaleRange = {
      id: `sc-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      from: newFrom,
      to: null, // Default: infinito para el último
      price: newPrice,
    };

    // Si el anterior tenía `to: null`, le asignamos un valor cerrado
    let updated = [...scaleRanges];
    if (lastRange && lastRange.to === null) {
      updated[updated.length - 1] = {
        ...lastRange,
        to: newFrom + 9,
      };
      newRange.from = newFrom + 10;
    }

    setScaleRanges([...updated, newRange]);
  };

  // Eliminar un rango de escala
  const handleRemoveScaleRange = (id: string) => {
    if (scaleRanges.length <= 1) return;
    setScaleRanges(scaleRanges.filter((r) => r.id !== id));
  };

  // Modificar un rango de escala
  const handleUpdateScaleRange = (
    id: string,
    field: 'from' | 'to' | 'price',
    value: number | null
  ) => {
    setScaleRanges((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // Guardar y persistir transaccionalmente en Supabase
  const handleSave = async () => {
    setIsSaving(true);
    const parsedPrice = Number(fixedPrice) || 0;
    const parsedMinPrice = hasMinimumCharge ? Number(minimumCharge) || 0 : 0;

    const updatedService: WorkshopService = {
      ...service,
      unit: selectedUnit,
      pricing_mode: pricingMode,
      rate_mode: pricingMode === 'escala' ? 'Por escala' : 'General',
      price: pricingMode === 'fijo' ? parsedPrice : (scaleRanges[0]?.price ?? parsedPrice),
      has_minimum_charge: hasMinimumCharge,
      min_price: parsedMinPrice,
      price_scales: scaleRanges,
      is_selected: true, // Al configurar un servicio queda activo en la carta
    };

    try {
      if (isSupabaseConfigured()) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(service.id);
        const payload: Record<string, any> = {
          name: updatedService.name,
          category: updatedService.category,
          rate_mode: updatedService.rate_mode,
          price: updatedService.price,
          unit: updatedService.unit,
          min_price: updatedService.min_price || 0,
          is_selected: true,
        };

        if (isUUID) {
          payload.id = service.id;
        }

        const { error } = await supabase
          .from('workshop_services')
          .upsert(payload, { onConflict: 'name' });

        if (error) {
          console.warn('Nota de sincronización Supabase en servicio:', error.message);
        }
      }
    } catch (err) {
      console.warn('Error al persistir servicio en Supabase:', err);
    } finally {
      setIsSaving(false);
      onSave(updatedService);
      onClose();
    }
  };

  return (
    <>
      {/* Modal Principal de Configuración */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
        <div
          className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E9E4D9] shadow-2xl flex flex-col gap-6 relative animate-in zoom-in-95 duration-200"
          style={{ maxHeight: '92vh', overflowY: 'auto' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#ECE7DC]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#E8F8F0] border border-[#A7F3D0] flex items-center justify-center text-[#10B981] shrink-0 shadow-2xs">
                <div className="w-7 h-7 rounded-full border-2 border-[#10B981] flex items-center justify-center font-black text-xs sm:text-sm">
                  <DollarSign className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl sm:text-2xl font-black text-[#262422] font-heading tracking-tight">
                  {service.name}
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  Así lo vas a cobrar
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sección UNIDAD */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              UNIDAD
            </label>

            {/* Dropdown / Botón Selector de Unidad */}
            <button
              type="button"
              onClick={() => setIsUnitSelectorOpen(true)}
              className="w-full flex items-center justify-between p-3.5 bg-white border border-[#E5DFD3] rounded-2xl cursor-pointer hover:border-[#10B981] transition-all shadow-2xs text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F8F0] text-[#10B981] flex items-center justify-center shrink-0">
                  <SelectedUnitIcon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-[#262422]">
                    {currentUnitOption.label}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {currentUnitOption.description}
                  </span>
                </div>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#10B981] transition-colors shrink-0 ml-2" />
            </button>
          </div>

          {/* Switcher de Modalidad de Cobro (Precio fijo vs Por escala) */}
          <div className="flex flex-col gap-3">
            <div className="inline-flex self-start bg-[#ECE7DC] p-0.5 rounded-xl border border-[#DDD5C7]">
              <button
                type="button"
                onClick={() => setPricingMode('fijo')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  pricingMode === 'fijo'
                    ? 'bg-[#262422] text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Precio fijo
              </button>
              <button
                type="button"
                onClick={() => setPricingMode('escala')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  pricingMode === 'escala'
                    ? 'bg-[#262422] text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Por escala
              </button>
            </div>

            {/* Modalidad 1: Precio Fijo (Imágenes 1 y 4) */}
            {pricingMode === 'fijo' && (
              <div className="flex items-center bg-white border border-[#E0D8CB] rounded-xl px-4 py-3 shadow-2xs focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-[#10B981]/20 transition-all">
                <span className="text-sm font-bold text-slate-500 mr-2.5">$</span>
                <input
                  type="number"
                  step="any"
                  value={fixedPrice}
                  onChange={(e) => setFixedPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-base font-bold text-slate-800 outline-none bg-transparent"
                />
              </div>
            )}

            {/* Modalidad 2: Por Escala (Imagen 2) */}
            {pricingMode === 'escala' && (
              <div className="flex flex-col gap-3">
                {/* Column Headers */}
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2.5 px-1 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <div>DESDE (MILL)</div>
                  <div>HASTA (MILL)</div>
                  <div>$</div>
                  <div className="w-5" />
                </div>

                {/* Rows de Rangos Dinámicos */}
                <div className="flex flex-col gap-2">
                  {scaleRanges.map((r, index) => (
                    <div
                      key={r.id || index}
                      className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2.5"
                    >
                      {/* DESDE */}
                      <div className="flex items-center bg-white border border-[#E0D8CB] rounded-xl px-2.5 py-2 shadow-2xs focus-within:border-[#10B981]">
                        <input
                          type="number"
                          value={r.from}
                          onChange={(e) =>
                            handleUpdateScaleRange(r.id, 'from', Number(e.target.value) || 0)
                          }
                          className="w-full text-sm font-bold text-slate-800 outline-none bg-transparent"
                        />
                        <span className="text-xs text-slate-500 font-medium ml-1 shrink-0">
                          {currentUnitOption.abbr}
                        </span>
                      </div>

                      {/* HASTA */}
                      <div className="flex items-center bg-white border border-[#E0D8CB] rounded-xl px-2.5 py-2 shadow-2xs focus-within:border-[#10B981]">
                        {r.to === null ? (
                          <span className="w-full text-sm font-bold text-slate-800">∞</span>
                        ) : (
                          <input
                            type="number"
                            value={r.to}
                            onChange={(e) =>
                              handleUpdateScaleRange(
                                r.id,
                                'to',
                                e.target.value === '' ? null : Number(e.target.value)
                              )
                            }
                            className="w-full text-sm font-bold text-slate-800 outline-none bg-transparent"
                          />
                        )}
                        <span className="text-xs text-slate-500 font-medium ml-1 shrink-0">
                          {currentUnitOption.abbr}
                        </span>
                      </div>

                      {/* PRECIO $ */}
                      <div className="flex items-center bg-white border border-[#E0D8CB] rounded-xl px-2.5 py-2 shadow-2xs focus-within:border-[#10B981]">
                        <span className="text-xs text-slate-500 font-bold mr-1">$</span>
                        <input
                          type="number"
                          step="any"
                          value={r.price}
                          onChange={(e) =>
                            handleUpdateScaleRange(r.id, 'price', Number(e.target.value) || 0)
                          }
                          className="w-full text-sm font-bold text-slate-800 outline-none bg-transparent"
                        />
                      </div>

                      {/* Botón Eliminar fila (x) */}
                      <button
                        type="button"
                        onClick={() => handleRemoveScaleRange(r.id)}
                        disabled={scaleRanges.length <= 1}
                        className={`p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer ${
                          scaleRanges.length <= 1 ? 'opacity-20 cursor-not-allowed' : ''
                        }`}
                        title="Eliminar rango"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Botón "+ Agregar rango" */}
                <button
                  type="button"
                  onClick={handleAddScaleRange}
                  className="self-start px-3.5 py-1.5 rounded-xl border border-[#10B981] bg-[#F0FDF4] text-[#047857] hover:bg-[#DCFCE7] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Agregar rango</span>
                </button>
              </div>
            )}
          </div>

          {/* Casilla de Verificación: "¿TIENE UN MÍNIMO A COBRAR?" (Imágenes 1, 2 y 4) */}
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setHasMinimumCharge(!hasMinimumCharge)}
              className="flex items-center gap-2.5 cursor-pointer select-none self-start group"
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  hasMinimumCharge
                    ? 'bg-[#10B981] text-white'
                    : 'border border-slate-300 bg-white group-hover:border-[#10B981]'
                }`}
              >
                {hasMinimumCharge && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span className="text-xs font-black text-slate-600 uppercase tracking-wide">
                ¿TIENE UN MÍNIMO A COBRAR?
              </span>
            </button>

            {/* Input condicional: Se despliega ÚNICAMENTE cuando está marcado */}
            {hasMinimumCharge && (
              <div className="flex items-stretch border border-[#E0D8CB] rounded-xl overflow-hidden shadow-2xs animate-in fade-in duration-200">
                <div className="bg-[#EFECE4] border-r border-[#E0D8CB] px-3.5 py-2.5 text-xs font-bold text-slate-600 flex items-center justify-center shrink-0">
                  mín $
                </div>
                <input
                  type="number"
                  step="any"
                  value={minimumCharge}
                  onChange={(e) => setMinimumCharge(e.target.value)}
                  placeholder="500"
                  className="w-full px-3.5 py-2.5 bg-white text-sm font-bold text-slate-800 outline-none focus:ring-1 focus:ring-[#10B981]"
                />
              </div>
            )}
          </div>

          {/* Footer con botones Cancelar y Guardar */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#ECE7DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-[#E0D8CB] bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer flex-1 text-center disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Modal Exacto para Selector de Unidades (Imagen 3) */}
      {isUnitSelectorOpen && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div
            className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#E9E4D9] shadow-2xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-200"
            style={{ maxHeight: '88vh' }}
          >
            {/* Header del selector de unidades */}
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE7DC]">
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-[#262422] font-heading tracking-tight">
                  Unidad de cobro
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Elige cómo se calcula este precio
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsUnitSelectorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer"
                aria-label="Cerrar selector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista Desplegable con las 10 opciones exactas de la Imagen 3 */}
            <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
              {EXACT_UNIT_OPTIONS.map((opt) => {
                const isSelected = selectedUnit === opt.id;
                const IconComponent = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedUnit(opt.id);
                      setIsUnitSelectorOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#10B981] bg-[#F4FDF7] shadow-xs'
                        : 'border-[#E5DFD3] bg-white hover:border-slate-300 hover:bg-[#FAF9F7]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#10B981] text-white'
                            : 'bg-[#E8F8F0] text-[#10B981]'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#262422]">
                          {opt.label}
                        </span>
                        <span className="text-xs text-slate-500 font-medium leading-snug">
                          {opt.description}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-5 h-5 text-[#10B981] stroke-[3] shrink-0 mr-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
