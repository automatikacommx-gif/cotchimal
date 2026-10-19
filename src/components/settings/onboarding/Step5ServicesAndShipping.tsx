import React, { useState } from 'react';
import { 
  OnboardingFullConfig, 
  WorkshopService, 
  ShippingZone,
  CompanySettings
} from '../../../types';
import { 
  Check, 
  Plus, 
  Trash2, 
  Truck, 
  CheckCircle2, 
  ArrowRight,
  X
} from 'lucide-react';
import { ServiceConfigModal } from './ServiceConfigModal';
import { OnboardingSummaryView, SummaryEditTarget } from './OnboardingSummaryView';
import { settingsService } from '../../../services/settingsService';

interface Step5Props {
  config: OnboardingFullConfig;
  clientsCount?: number;
  onUpdateServices: (services: WorkshopService[]) => void;
  onUpdateShippingZones: (zones: ShippingZone[]) => void;
  onUpdateCompany?: (updated: Partial<CompanySettings>) => void;
  onEditSection?: (target: SummaryEditTarget) => void;
  onOpenSummary?: () => void;
  onPrev: () => void;
  onFinish: () => void;
  onGoToQuote: () => void;
  onGoToClients?: () => void;
}

export const Step5ServicesAndShipping: React.FC<Step5Props> = ({
  config,
  clientsCount = 0,
  onUpdateServices,
  onUpdateShippingZones,
  onUpdateCompany,
  onEditSection,
  onOpenSummary,
  onPrev,
  onFinish,
  onGoToQuote,
  onGoToClients,
}) => {
  const [subStep, setSubStep] = useState<1 | 2 | 3>(1); // 1 = Servicios, 2 = Envíos, 3 = Resumen

  // Modal Dinámico de Configuración de Servicios (Imágenes 1, 2, 3 y 4)
  const [selectedServiceToConfig, setSelectedServiceToConfig] = useState<WorkshopService | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  const handleOpenConfigModal = (service: WorkshopService) => {
    setSelectedServiceToConfig(service);
    setIsConfigModalOpen(true);
  };

  const handleSaveServiceConfig = async (updatedService: WorkshopService) => {
    const updated = config.services.map((s) =>
      s.id === updatedService.id ? updatedService : s
    );
    onUpdateServices(updated);
    await settingsService.saveSingleService(updatedService);
  };

  // New custom service state
  const [isAddCustomServiceOpen, setIsAddCustomServiceOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState<WorkshopService['category']>('acabados');
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('100');
  const [customServiceUnit, setCustomServiceUnit] = useState('por millar');

  // New shipping zone state
  const [newZoneName, setNewZoneName] = useState('');
  const [newZonePrice, setNewZonePrice] = useState('200');
  const [isAddingZone, setIsAddingZone] = useState(false);

  const toggleService = (id: string) => {
    onUpdateServices(
      config.services.map((s) =>
        s.id === id ? { ...s, is_selected: !s.is_selected } : s
      )
    );
  };

  const handleAddCustomService = () => {
    if (!customServiceName.trim()) return;
    const newService: WorkshopService = {
      id: `srv-${Date.now()}`,
      name: customServiceName.trim(),
      category: customCategory,
      rate_mode: 'General',
      price: Number(customServicePrice) || 50,
      unit: customServiceUnit,
      is_selected: true,
    };
    onUpdateServices([...config.services, newService]);
    setCustomServiceName('');
    setIsAddCustomServiceOpen(false);
  };

  const handleAddZone = () => {
    if (!newZoneName.trim()) return;
    const newZone: ShippingZone = {
      id: `zone-${Date.now()}`,
      name: newZoneName.trim(),
      price: Number(newZonePrice) || 150,
      unit: '/proyecto',
    };
    onUpdateShippingZones([...config.shipping_zones, newZone]);
    setNewZoneName('');
    setIsAddingZone(false);
  };

  const handleDeleteZone = (id: string) => {
    onUpdateShippingZones(config.shipping_zones.filter((z) => z.id !== id));
  };

  const hasEditorial = config.company.work_types.includes('editorial');
  const hasEmpaque = config.company.work_types.includes('empaque');

  const editorialServices = config.services.filter((s) => s.category === 'editorial');
  const empaqueServices = config.services.filter((s) => s.category === 'empaque');
  const coatingServices = config.services.filter((s) => s.category === 'recubrimientos');
  const finishingServices = config.services.filter((s) => s.category === 'acabados');
  const prepressServices = config.services.filter((s) => s.category === 'preprensa');
  const productionServices = config.services.filter((s) => s.category === 'produccion');
  const logisticsServices = config.services.filter((s) => s.category === 'logistica');
  const selectedServices = config.services.filter((s) => s.is_selected);

  const handleFinalize = () => {
    onFinish();
  };

  return (
    <div
      className={
        subStep === 3
          ? 'w-full'
          : 'w-full max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#E9E4D9] shadow-sm flex flex-col gap-8'
      }
    >
      {/* Sub-Stepper Tabs */}
      {subStep !== 3 && (
        <div className="flex items-center justify-between max-w-md mx-auto w-full relative mb-2">
          <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-slate-200 -translate-y-1/2 -z-0">
            <div
              className={`h-full bg-[#10B981] transition-all ${
                subStep === 2 ? 'w-1/2' : 'w-0'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={() => setSubStep(1)}
            className="flex flex-col items-center gap-1 z-10 bg-white px-2 cursor-pointer"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                subStep === 1
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'bg-[#DCFCE7] text-[#10B981]'
              }`}
            >
              {subStep === 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
            </div>
            <span
              className={`text-[11px] font-bold tracking-tight ${
                subStep === 1 ? 'text-[#10B981]' : 'text-slate-500'
              }`}
            >
              Servicios
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubStep(2)}
            className="flex flex-col items-center gap-1 z-10 bg-white px-2 cursor-pointer"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                subStep === 2
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </div>
            <span
              className={`text-[11px] font-bold tracking-tight ${
                subStep === 2 ? 'text-[#10B981]' : 'text-slate-400'
              }`}
            >
              Envíos
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenSummary) {
                onOpenSummary();
              } else {
                setSubStep(3);
              }
            }}
            className="flex flex-col items-center gap-1 z-10 bg-white px-2 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-all bg-slate-200 text-slate-500 hover:bg-[#DCFCE7] hover:text-[#10B981]">
              3
            </div>
            <span className="text-[11px] font-bold tracking-tight text-slate-400 hover:text-[#10B981]">
              Resumen
            </span>
          </button>
        </div>
      )}

      {/* SUB-PASO 1: CARTA DE SERVICIOS */}
      {subStep === 1 && (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black tracking-widest text-[#10B981] uppercase">
              PASO 5 DE 5
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#262422] tracking-tight font-heading">
              Tu carta de servicios
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Selecciona los acabados y servicios que ofreces. Podrás editarlos y agregar más en cualquier momento.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Si seleccionó Editorial */}
            {hasEditorial && (
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  ENCUADERNACIÓN · EDITORIAL ({editorialServices.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {editorialServices.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleOpenConfigModal(s)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                        s.is_selected
                          ? 'border-[#10B981] bg-[#F4FDF7]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 group-hover:text-[#10B981] transition-colors">{s.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {s.pricing_mode === 'escala' ? 'Por escala' : `$${s.price}`} · {s.unit}{s.has_minimum_charge && s.min_price ? ` · mín $${s.min_price}` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleService(s.id);
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          s.is_selected ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                        }`}
                        title={s.is_selected ? 'Desmarcar' : 'Marcar'}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Si seleccionó Empaque */}
            {hasEmpaque && (
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  ARMADO · EMPAQUE ({empaqueServices.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {empaqueServices.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleOpenConfigModal(s)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                        s.is_selected
                          ? 'border-[#10B981] bg-[#F4FDF7]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 group-hover:text-[#10B981] transition-colors">{s.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {s.pricing_mode === 'escala' ? 'Por escala' : `$${s.price}`} · {s.unit}{s.has_minimum_charge && s.min_price ? ` · mín $${s.min_price}` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleService(s.id);
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          s.is_selected ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                        }`}
                        title={s.is_selected ? 'Desmarcar' : 'Marcar'}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recubrimientos */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  RECUBRIMIENTOS ({coatingServices.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomCategory('recubrimientos');
                    setIsAddCustomServiceOpen(true);
                  }}
                  className="text-xs font-black text-[#10B981] hover:underline cursor-pointer"
                >
                  + Agregar el mío
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {coatingServices.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleOpenConfigModal(s)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                      s.is_selected
                        ? 'border-[#10B981] bg-[#F4FDF7]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-800 group-hover:text-[#10B981] transition-colors">{s.name}</span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {s.pricing_mode === 'escala' ? 'Por escala' : `$${s.price}`} · {s.unit}{s.has_minimum_charge && s.min_price ? ` · mín $${s.min_price}` : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleService(s.id);
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        s.is_selected ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                      }`}
                      title={s.is_selected ? 'Desmarcar' : 'Marcar'}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Acabados */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  ACABADOS ({finishingServices.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomCategory('acabados');
                    setIsAddCustomServiceOpen(true);
                  }}
                  className="text-xs font-black text-[#10B981] hover:underline cursor-pointer"
                >
                  + Agregar el mío
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {finishingServices.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleOpenConfigModal(s)}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                      s.is_selected
                        ? 'border-[#10B981] bg-[#F4FDF7]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-800 group-hover:text-[#10B981] transition-colors">{s.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {s.pricing_mode === 'escala' ? 'Por escala' : `$${s.price}`} · {s.unit}{s.has_minimum_charge && s.min_price ? ` · mín $${s.min_price}` : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleService(s.id);
                      }}
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        s.is_selected ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                      }`}
                      title={s.is_selected ? 'Desmarcar' : 'Marcar'}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pre-prensa / Diseño */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  PRE-PRENSA · DISEÑO ({prepressServices.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomCategory('preprensa');
                    setIsAddCustomServiceOpen(true);
                  }}
                  className="text-xs font-black text-[#10B981] hover:underline cursor-pointer"
                >
                  + Agregar el mío
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {prepressServices.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleOpenConfigModal(s)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                      s.is_selected
                        ? 'border-[#10B981] bg-[#F4FDF7]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-800 group-hover:text-[#10B981] transition-colors">{s.name}</span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {s.pricing_mode === 'escala' ? 'Por escala' : `$${s.price}`} · {s.unit}{s.has_minimum_charge && s.min_price ? ` · mín $${s.min_price}` : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleService(s.id);
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        s.is_selected ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                      }`}
                      title={s.is_selected ? 'Desmarcar' : 'Marcar'}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Producción (si existen) */}
            {productionServices.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  PRODUCCIÓN ({productionServices.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {productionServices.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleOpenConfigModal(s)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                        s.is_selected
                          ? 'border-[#10B981] bg-[#F4FDF7]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 group-hover:text-[#10B981] transition-colors">{s.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {s.pricing_mode === 'escala' ? 'Por escala' : `$${s.price}`} · {s.unit}{s.has_minimum_charge && s.min_price ? ` · mín $${s.min_price}` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleService(s.id);
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          s.is_selected ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                        }`}
                        title={s.is_selected ? 'Desmarcar' : 'Marcar'}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logística & Empaque (si existen) */}
            {logisticsServices.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  LOGÍSTICA & EMPAQUE ({logisticsServices.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {logisticsServices.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleOpenConfigModal(s)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                        s.is_selected
                          ? 'border-[#10B981] bg-[#F4FDF7]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 group-hover:text-[#10B981] transition-colors">{s.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {s.pricing_mode === 'escala' ? 'Por escala' : `$${s.price}`} · {s.unit}{s.has_minimum_charge && s.min_price ? ` · mín $${s.min_price}` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleService(s.id);
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          s.is_selected ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                        }`}
                        title={s.is_selected ? 'Desmarcar' : 'Marcar'}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onPrev}
              className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5"
            >
              <span>← Anterior</span>
            </button>

            <button
              type="button"
              onClick={() => setSubStep(2)}
              className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-[#10B981] hover:bg-[#059669] flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span>Continuar a envíos</span>
              <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* SUB-PASO 2: ZONAS DE ENVÍO */}
      {subStep === 2 && (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black tracking-widest text-[#10B981] uppercase">
              PASO 5 DE 5
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#262422] tracking-tight font-heading">
              Tus zonas de envío
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Configura los costos de flete y entrega a domicilio para incluirlos automáticamente en cotizaciones.
            </p>
          </div>

          {/* Shipping Zones List */}
          <div className="flex flex-col gap-3">
            {config.shipping_zones.map((zone) => (
              <div
                key={zone.id}
                className="p-4 bg-[#FAFBF9] border border-slate-200 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#10B981] flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#262422]">{zone.name}</h4>
                    <span className="text-xs text-slate-400 font-medium">
                      Tarifa de flete {zone.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-[#10B981]">
                    ${zone.price} {zone.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteZone(zone.id)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {isAddingZone ? (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col gap-3">
                <span className="text-xs font-black text-slate-800">
                  Nueva Zona de Envío
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Nombre de la Zona
                    </label>
                    <input
                      type="text"
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      placeholder="Ej. Zona Centro o Área Metropolitana"
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Costo ($ MXN)
                    </label>
                    <input
                      type="number"
                      value={newZonePrice}
                      onChange={(e) => setNewZonePrice(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingZone(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddZone}
                    className="px-5 py-2 bg-[#10B981] text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Guardar Zona
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingZone(true)}
                className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-[#10B981] hover:bg-[#F0FDF4] rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-[#10B981] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar zona de envío</span>
              </button>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSubStep(1)}
              className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5"
            >
              <span>← Servicios</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenSummary) {
                  onOpenSummary();
                } else {
                  setSubStep(3);
                }
              }}
              className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-[#10B981] hover:bg-[#059669] flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span>Ver resumen</span>
              <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* SUB-PASO 3: RESUMEN DE CONFIGURACIÓN COMPLETA */}
      {subStep === 3 && (
        <OnboardingSummaryView
          config={config}
          clientsCount={clientsCount}
          onEditSection={(target) => {
            if (onEditSection) {
              onEditSection(target);
            }
          }}
          onUpdateCompany={onUpdateCompany}
          onFinalize={handleFinalize}
          onGoToQuote={onGoToQuote}
          onGoToClients={onGoToClients}
        />
      )}

      {/* Modal Agregar Servicio Personalizado */}
      {isAddCustomServiceOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#262422]">
                Agregar servicio personalizado
              </h3>
              <button
                onClick={() => setIsAddCustomServiceOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  placeholder="Ej. Encuadernación holandesa"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Precio ($ MXN)
                  </label>
                  <input
                    type="number"
                    value={customServicePrice}
                    onChange={(e) => setCustomServicePrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Unidad de Cobro
                  </label>
                  <select
                    value={customServiceUnit}
                    onChange={(e) => setCustomServiceUnit(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#10B981]"
                  >
                    <option value="por pieza">por pieza</option>
                    <option value="por millar">por millar</option>
                    <option value="por m²">por m²</option>
                    <option value="por proyecto">por proyecto</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddCustomServiceOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddCustomService}
                className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-white shadow-2xs"
              >
                Agregar Servicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dinámico de Parámetros de Servicio (Imágenes de Referencia 1, 2, 3 y 4) */}
      <ServiceConfigModal
        isOpen={isConfigModalOpen}
        service={selectedServiceToConfig}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedServiceToConfig(null);
        }}
        onSave={handleSaveServiceConfig}
      />
    </div>
  );
};
