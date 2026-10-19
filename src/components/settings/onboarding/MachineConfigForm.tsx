import React, { useState, useEffect } from 'react';
import { Printer, X, Search, ArrowRight, ArrowLeft } from 'lucide-react';
import { MachineModel, WorkshopMachine } from '../../../types/machines';
import { machinesCatalog } from '../../../data/machinesData';

interface MachineConfigFormProps {
  isOpen: boolean;
  initialMachine?: WorkshopMachine | null;
  onClose: () => void;
  onSave: (machineData: Partial<WorkshopMachine>) => void;
}

export const MachineConfigForm: React.FC<MachineConfigFormProps> = ({
  isOpen,
  initialMachine,
  onClose,
  onSave,
}) => {
  const [view, setView] = useState<'catalog' | 'form'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [maxWidth, setMaxWidth] = useState('75');
  const [maxHeight, setMaxHeight] = useState('53');
  const [maxCalibre, setMaxCalibre] = useState('18');
  const [gripper, setGripper] = useState('0.5');
  const [counterGripper, setCounterGripper] = useState('0.5');
  const [guide, setGuide] = useState('0.5');
  const [counterGuide, setCounterGuide] = useState('0.5');

  // Si se pasa una máquina existente para editar, ir directamente al formulario
  useEffect(() => {
    if (initialMachine) {
      setName(initialMachine.name || '');
      setTag(initialMachine.tag || '');
      setMaxWidth(String(initialMachine.max_width_cm || 75));
      setMaxHeight(String(initialMachine.max_height_cm || 53));
      setMaxCalibre(
        initialMachine.max_calibre_pts !== undefined
          ? String(initialMachine.max_calibre_pts)
          : ''
      );
      setGripper(String(initialMachine.gripper_margin_cm ?? 0.5));
      setCounterGripper(String(initialMachine.counter_gripper_margin_cm ?? 0.5));
      setGuide(String(initialMachine.guide_margin_cm ?? 0.5));
      setCounterGuide(String(initialMachine.counter_guide_margin_cm ?? 0.5));
      setView('form');
    } else {
      // Nueva máquina: abrir en vista catálogo
      setView('catalog');
      setSearchQuery('');
      // Valores por defecto sugeridos
      setName('');
      setTag('');
      setMaxWidth('75');
      setMaxHeight('53');
      setMaxCalibre('18');
      setGripper('0.5');
      setCounterGripper('0.5');
      setGuide('0.5');
      setCounterGuide('0.5');
    }
  }, [initialMachine, isOpen]);

  if (!isOpen) return null;

  // Cálculo reactivo del área útil de impresión
  const parsedWidth = parseFloat(maxWidth) || 0;
  const parsedHeight = parseFloat(maxHeight) || 0;
  const parsedGripper = parseFloat(gripper) || 0;
  const parsedCounterGripper = parseFloat(counterGripper) || 0;
  const parsedGuide = parseFloat(guide) || 0;
  const parsedCounterGuide = parseFloat(counterGuide) || 0;

  const usefulWidth = Math.max(
    0,
    Math.round((parsedWidth - parsedGuide - parsedCounterGuide) * 10) / 10
  );
  const usefulHeight = Math.max(
    0,
    Math.round((parsedHeight - parsedGripper - parsedCounterGripper) * 10) / 10
  );

  const usefulAreaLabel = `${usefulWidth % 1 === 0 ? usefulWidth : usefulWidth.toFixed(1)}×${
    usefulHeight % 1 === 0 ? usefulHeight : usefulHeight.toFixed(1)
  } cm`;

  // Al seleccionar un modelo del catálogo predeterminado
  const handleSelectPreset = (preset: MachineModel) => {
    setName(preset.name);
    setTag(preset.tag || `${preset.brand} · ${preset.technology}`);
    setMaxWidth(String(preset.max_width_cm));
    setMaxHeight(String(preset.max_height_cm));
    setMaxCalibre(preset.max_calibre_pts !== undefined ? String(preset.max_calibre_pts) : '');
    setGripper(String(preset.gripper_margin_cm));
    setCounterGripper(String(preset.counter_gripper_margin_cm));
    setGuide(String(preset.guide_margin_cm));
    setCounterGuide(String(preset.counter_guide_margin_cm));
    setView('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      tag: tag.trim(),
      max_width_cm: parsedWidth,
      max_height_cm: parsedHeight,
      max_calibre_pts: maxCalibre.trim() ? parseFloat(maxCalibre) : undefined,
      gripper_margin_cm: parsedGripper,
      counter_gripper_margin_cm: parsedCounterGripper,
      guide_margin_cm: parsedGuide,
      counter_guide_margin_cm: parsedCounterGuide,
      useful_width_cm: usefulWidth,
      useful_height_cm: usefulHeight,
      sheet_size: `${parsedWidth}×${parsedHeight} cm`,
    });
  };

  const filteredCatalog = machinesCatalog.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.tag && m.tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[92vh] overflow-y-auto border border-[#E9E4D9] shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200">
        {/* Header del Modal */}
        <div className="flex items-center justify-between border-b border-[#E9E4D9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] border border-[#A7F3D0] text-[#10B981] flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#262422] tracking-tight">
                {initialMachine ? 'Editar máquina' : 'Nueva máquina'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Ingresa los datos de tu máquina
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VISTA 1: CATÁLOGO DE MÁQUINAS (A-Z) */}
        {view === 'catalog' && (
          <div className="flex flex-col gap-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca tu prensa — ej. HP Indigo, Koenig & Bauer, Canon..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#10B981] outline-none shadow-2xs transition-all"
              />
            </div>

            {/* Listado ordenado */}
            <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredCatalog.map((model) => (
                <div
                  key={model.id}
                  className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-[#10B981] hover:shadow-2xs transition-all group"
                >
                  <div className="flex flex-col gap-0.5 truncate pr-3">
                    <h4 className="text-sm font-black text-[#262422] group-hover:text-[#10B981] transition-colors truncate">
                      {model.name}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium truncate">
                      {model.tag}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset(model)}
                    className="px-3.5 py-1.5 text-xs font-bold text-[#10B981] hover:text-emerald-700 flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                  >
                    <span>Usar esta</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Enlace para agregar manualmente */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setView('form')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors underline underline-offset-2 cursor-pointer"
              >
                ¿No la encuentras? Agrégala manualmente
              </button>
            </div>

            {/* Botón inferior Cancelar */}
            <div className="flex items-center justify-end pt-3 border-t border-[#E9E4D9]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* VISTA 2: FORMULARIO DE DETALLE TÉCNICO EXACTO */}
        {view === 'form' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* SECCIÓN 1: IDENTIDAD */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-black text-slate-400 tracking-wider uppercase">
                IDENTIDAD
              </span>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  NOMBRE / MODELO <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. HP Indigo 12K, Koenig & Bauer Rapida 75 PRO"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-[#262422] focus:border-[#10B981] outline-none shadow-2xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  TAG / DESCRIPCIÓN <span className="text-slate-400 font-normal">[OPCIONAL]</span>
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Ej. Digital · 75×53 cm · 18 pts"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:border-[#10B981] outline-none shadow-2xs"
                />
              </div>
            </div>

            {/* SECCIÓN 2: DIMENSIONES */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-black text-slate-400 tracking-wider uppercase">
                DIMENSIONES
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">
                    TAM. MÁX. ANCHO (CM)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-[#262422] focus:border-[#10B981] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">
                    TAM. MÁX. ALTO (CM)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-[#262422] focus:border-[#10B981] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">
                    CALIBRE MÁXIMO <span className="text-slate-400 font-normal">[OPCIONAL]</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={maxCalibre}
                      onChange={(e) => setMaxCalibre(e.target.value)}
                      placeholder="18"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-[#262422] focus:border-[#10B981] outline-none pr-10"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      pts
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: MÁRGENES NO IMPRIMIBLES */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-black text-slate-400 tracking-wider uppercase">
                MÁRGENES NO IMPRIMIBLES (CM) — SE RESTAN DEL PLIEGO
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    PINZA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={gripper}
                    onChange={(e) => setGripper(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#262422] focus:border-[#10B981] outline-none text-center"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    CONTRA-PINZA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={counterGripper}
                    onChange={(e) => setCounterGripper(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#262422] focus:border-[#10B981] outline-none text-center"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    ESCUADRA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={guide}
                    onChange={(e) => setGuide(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#262422] focus:border-[#10B981] outline-none text-center"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    CONTRA-ESCUADRA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={counterGuide}
                    onChange={(e) => setCounterGuide(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#262422] focus:border-[#10B981] outline-none text-center"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: RECUADRO VERDE DE ÁREA ÚTIL CALCULADA */}
            <div className="p-4 bg-[#E8F8F0] border border-[#A7F3D0] rounded-2xl flex items-center justify-between text-[#065F46] shadow-2xs">
              <span className="text-xs sm:text-sm font-semibold">
                Área útil de impresión:
              </span>
              <strong className="text-sm sm:text-base font-black text-[#047857]">
                {usefulAreaLabel}
              </strong>
            </div>

            {/* Texto de pie fiel a las imágenes */}
            <p className="text-[11px] text-slate-500 font-medium">
              Los precios ($/hora, láminas, papel) se capturan a continuación, al terminar de agregar tus máquinas.
            </p>

            {/* Botones de acción */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E9E4D9]">
              {!initialMachine ? (
                <button
                  type="button"
                  onClick={() => setView('catalog')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver al catálogo</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                >
                  {initialMachine ? 'Guardar cambios' : 'Agregar máquina'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
