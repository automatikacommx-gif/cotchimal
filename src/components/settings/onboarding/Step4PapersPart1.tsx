import React, { useState } from 'react';
import { PaperType, PaperCategory } from '../../../types';
import { Check, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';

interface Step4PapersPart1Props {
  papers: PaperType[];
  onUpdatePapers: (papers: PaperType[]) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step4PapersPart1: React.FC<Step4PapersPart1Props> = ({
  papers,
  onUpdatePapers,
  onPrev,
  onNext,
}) => {
  const [showCommon, setShowCommon] = useState(false);
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCode, setCustomCode] = useState('');

  // Separar papeles por categoría
  // Top 3 frecuentes: Bond, Couché, Opalina
  const frequentPapers = papers.filter((p) => p.category === 'frecuente');
  // 8 tipos comunes: Micro Flauta E, Corrugado Flauta B, Bristol, Autoadherible, etc.
  const commonPapers = papers.filter((p) => p.category === 'comun');
  // Personalizados añadidos por el usuario
  const customPapers = papers.filter((p) => p.category === 'personalizado');

  const togglePaper = (id: string) => {
    onUpdatePapers(
      papers.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    const code = (customCode.trim() || customName.trim().slice(0, 3)).toUpperCase();
    const newPaper: PaperType = {
      id: `custom-paper-${Date.now()}`,
      code: code.slice(0, 3),
      name: customName.trim(),
      description: customDesc.trim() || 'Papel personalizado del taller',
      category: 'personalizado',
      selected: true,
      grammages: [
        {
          grammage: 120,
          width_cm: 57,
          height_cm: 87,
          price_per_thousand: 1400,
        },
      ],
    };

    onUpdatePapers([...papers, newPaper]);
    setCustomName('');
    setCustomDesc('');
    setCustomCode('');
    setIsAddCustomOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#E9E4D9] shadow-sm flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-black tracking-widest text-[#10B981] uppercase font-sans">
          PASO 4 DE 5
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#262422] tracking-tight font-heading">
          Arma tu catálogo de papeles
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Te sugerimos los más usados en <strong className="text-slate-700 font-bold">tu giro</strong>. Quita los que no manejes y agrega los tuyos para tenerlo a tu medida.
        </p>
      </div>

      {/* Top Row: 3 Frecuentes (Bond, Couché, Opalina) + "+ Agregar el mío" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {frequentPapers.map((paper) => {
          const isSelected = paper.selected;

          return (
            <div
              key={paper.id}
              onClick={() => togglePaper(paper.id)}
              className={`relative flex flex-col items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer select-none text-center min-h-[160px] ${
                isSelected
                  ? 'border-[#10B981] bg-[#F4FDF7] shadow-2xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Checkmark Circle top right */}
              <div
                className={`absolute top-3.5 right-3.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#10B981] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-300'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>

              {/* Paper Code Tag */}
              <div
                className={`w-12 h-10 rounded-xl flex items-center justify-center text-xs font-black tracking-wider transition-colors mb-2 ${
                  isSelected ? 'bg-[#DCFCE7] text-[#10B981]' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {paper.code}
              </div>

              {/* Title & Description */}
              <div className="flex flex-col gap-1 items-center">
                <h3 className="text-base font-black text-[#262422] tracking-tight font-heading">
                  {paper.name}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium leading-tight">
                  {paper.description}
                </p>
              </div>

              <div className="h-1" />
            </div>
          );
        })}

        {/* Card: + Agregar el mío (A tu medida) */}
        <div
          onClick={() => setIsAddCustomOpen(true)}
          className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-[#10B981]/50 bg-[#F0FDF4]/50 hover:bg-[#F0FDF4] hover:border-[#10B981] transition-all cursor-pointer select-none text-center min-h-[160px] group"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#10B981] mb-2 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-sm font-black text-[#262422] group-hover:text-[#10B981] transition-colors">
            Agregar el mío
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">A tu medida</p>
        </div>
      </div>

      {/* Toggle button: Ver otros tipos comunes (8) v */}
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setShowCommon(!showCommon)}
          className="self-start text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
        >
          <span>
            {showCommon ? 'Ocultar otros tipos' : `Ver otros tipos comunes (${commonPapers.length})`}
          </span>
          {showCommon ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* 8 Common Papers Grid (Inactive by default) */}
        {showCommon && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-2 animate-in fade-in duration-200">
            {commonPapers.map((paper) => {
              const isSelected = paper.selected;

              return (
                <div
                  key={paper.id}
                  onClick={() => togglePaper(paper.id)}
                  className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer select-none text-center min-h-[150px] ${
                    isSelected
                      ? 'border-[#10B981] bg-[#F4FDF7] shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Checkmark Circle top right */}
                  <div
                    className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#10B981] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-300'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>

                  {/* Code Tag */}
                  <div
                    className={`w-10 h-8 rounded-lg flex items-center justify-center text-[10px] font-black tracking-wider transition-colors mb-1.5 ${
                      isSelected ? 'bg-[#DCFCE7] text-[#10B981]' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {paper.code}
                  </div>

                  {/* Title & Desc */}
                  <div className="flex flex-col gap-0.5 items-center">
                    <h4 className="text-xs font-black text-[#262422] leading-tight">
                      {paper.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-tight">
                      {paper.description}
                    </p>
                  </div>

                  <div className="h-0.5" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Papeles personalizados si existen */}
      {customPapers.length > 0 && (
        <div className="flex flex-col gap-3 pt-2">
          <span className="text-[11px] font-black tracking-wider uppercase text-slate-500">
            PERSONALIZADOS ({customPapers.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {customPapers.map((paper) => (
              <div
                key={paper.id}
                className="p-4 rounded-2xl border-2 border-[#10B981] bg-[#F4FDF7] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-[#DCFCE7] text-[#10B981]">
                    {paper.code}
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-[#262422]">{paper.name}</h4>
                    <p className="text-[11px] text-slate-400">{paper.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdatePapers(papers.filter((p) => p.id !== paper.id))}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
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
          className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-[#10B981] hover:bg-[#059669] flex items-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Ver gramajes y precios</span>
          <span>→</span>
        </button>
      </div>

      {/* Modal para Agregar el mío */}
      {isAddCustomOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#262422]">
                Agregar papel personalizado
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCustomOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">
                  Nombre del papel o sustrato *
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ej. Cartulina Sulfatada 1 Cara"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">
                  Código (3 letras)
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="Ej. SUL"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#10B981] uppercase"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">
                  Descripción o usos comunes
                </label>
                <input
                  type="text"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Ej. Cajas cosméticas, empaque farmacéutico"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#10B981]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddCustomOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddCustom}
                className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-white shadow-2xs"
              >
                Agregar al catálogo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
