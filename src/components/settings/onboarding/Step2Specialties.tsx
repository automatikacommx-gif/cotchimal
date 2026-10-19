import React, { useState, useEffect } from 'react';
import { LayoutGrid, BookOpen, Package, Check, Maximize2 } from 'lucide-react';

export type WorkTypeId = 'general' | 'editorial' | 'empaque' | 'gran_formato';

interface Step2SpecialtiesProps {
  selectedTypes?: WorkTypeId[];
  onChange?: (types: WorkTypeId[]) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export const Step2Specialties: React.FC<Step2SpecialtiesProps> = ({
  selectedTypes: externalSelectedTypes,
  onChange,
  onPrev,
  onNext,
}) => {
  // Estado inicial garantizado con exclusivamente ['general'] activo por defecto
  const [selectedTypes, setSelectedTypes] = useState<WorkTypeId[]>(() => {
    if (externalSelectedTypes && externalSelectedTypes.length > 0) {
      // Garantizar que 'general' siempre esté presente
      return externalSelectedTypes.includes('general')
        ? externalSelectedTypes
        : ['general', ...externalSelectedTypes];
    }
    return ['general'];
  });

  // Sincronizar si cambia el prop externo
  useEffect(() => {
    if (externalSelectedTypes && externalSelectedTypes.length > 0) {
      const ensured = externalSelectedTypes.includes('general')
        ? externalSelectedTypes
        : ['general', ...externalSelectedTypes];
      setSelectedTypes(ensured);
    }
  }, [externalSelectedTypes]);

  const toggleType = (type: WorkTypeId) => {
    if (type === 'general') return; // Siempre activo según la guía técnica

    let nextTypes: WorkTypeId[];
    if (selectedTypes.includes(type)) {
      nextTypes = selectedTypes.filter((t) => t !== type);
    } else {
      nextTypes = [...selectedTypes, type];
    }

    setSelectedTypes(nextTypes);
    if (onChange) {
      onChange(nextTypes);
    }
  };

  const handleNext = () => {
    if (onChange) {
      onChange(selectedTypes);
    }
    if (onNext) {
      onNext();
    }
  };

  const workCards = [
    {
      id: 'general' as const,
      title: 'General',
      description: 'Tarjetas, volantes, posters, etiquetas',
      badge: 'SIEMPRE ACTIVO',
      alwaysActive: true,
      icon: LayoutGrid,
    },
    {
      id: 'editorial' as const,
      title: 'Editorial',
      description: 'Revistas, libros, folletos, catálogos',
      alwaysActive: false,
      icon: BookOpen,
    },
    {
      id: 'empaque' as const,
      title: 'Empaque',
      description: 'Cajas, plegadizo, corrugado',
      alwaysActive: false,
      icon: Package,
    },
    {
      id: 'gran_formato' as const,
      title: 'Gran Formato',
      description: 'Lonas, viniles, rígidos, gigantografías',
      alwaysActive: false,
      icon: Maximize2,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#E9E4D9] shadow-sm flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-black tracking-widest text-[#10B981] uppercase font-sans">
          PASO 2 DE 5
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#262422] tracking-tight font-heading">
          ¿Qué tipo de trabajos haces?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Selecciona todos los que apliquen. Esto configura los acabados, sustratos y materiales disponibles en tu cotizador.
        </p>
      </div>

      {/* Cards Grid: 4 options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {workCards.map((card) => {
          const isSelected = selectedTypes.includes(card.id);
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              onClick={() => toggleType(card.id)}
              className={`relative flex flex-col items-center justify-between p-6 rounded-2xl border-2 transition-all select-none text-center min-h-[230px] ${
                card.alwaysActive
                  ? 'cursor-default'
                  : 'cursor-pointer hover:shadow-xs'
              } ${
                isSelected
                  ? 'border-[#10B981] bg-[#F4FDF7]'
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

              {/* Central Graphic Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                  isSelected ? 'bg-[#DCFCE7] text-[#10B981]' : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Icon className="w-7 h-7" />
              </div>

              {/* Title and Description */}
              <div className="flex flex-col gap-1.5 items-center">
                <h3 className="text-base font-black text-[#262422] tracking-tight font-heading">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[190px]">
                  {card.description}
                </p>
              </div>

              {/* Badge for always active */}
              {card.badge ? (
                <div className="mt-3">
                  <span className="text-[9px] font-black tracking-wider uppercase text-[#10B981] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                    {card.badge}
                  </span>
                </div>
              ) : (
                <div className="h-5 mt-3" />
              )}
            </div>
          );
        })}
      </div>

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
          onClick={handleNext}
          className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-[#10B981] hover:bg-[#059669] flex items-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Continuar</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
