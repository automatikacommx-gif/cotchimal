import React, { useState, useEffect } from 'react';
import { OnboardingFullConfig, WorkshopService, ShippingZone } from '../../types';
import { settingsService } from '../../services/settingsService';
import { 
  Calculator, 
  DollarSign, 
  Scissors, 
  Layers, 
  Check, 
  Save, 
  Sparkles, 
  Plus, 
  Trash2, 
  Package, 
  Truck, 
  Printer, 
  FileEdit, 
  Search,
  CheckCircle2,
  RefreshCw,
  Sliders
} from 'lucide-react';

export type TarifarioTab = 'preprensa' | 'produccion' | 'recubrimiento' | 'acabados' | 'logistica';

interface TarifarioViewProps {
  onShowToast: (toast: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

export const TarifarioView: React.FC<TarifarioViewProps> = ({ onShowToast }) => {
  const [config, setConfig] = useState<OnboardingFullConfig | null>(null);
  const [activeTab, setActiveTab] = useState<TarifarioTab>('preprensa');
  const [isSaving, setIsSaving] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Estados para nuevo concepto
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number | ''>('');
  const [newServiceUnit, setNewServiceUnit] = useState('por millar');
  const [newServiceMinPrice, setNewServiceMinPrice] = useState<number | ''>('');

  // Estados para nueva zona de envío
  const [newZoneName, setNewZoneName] = useState('');
  const [newZonePrice, setNewZonePrice] = useState<number | ''>('');
  const [newZoneUnit, setNewZoneUnit] = useState('/proyecto');

  useEffect(() => {
    settingsService.getConfig().then(setConfig);
  }, []);

  if (!config) {
    return (
      <div className="w-full py-16 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-[#10B981]" />
        <span className="text-sm font-semibold">Cargando tarifario maestro...</span>
      </div>
    );
  }

  const handleSaveAll = async () => {
    setIsSaving(true);
    const res = await settingsService.saveFullConfig(config);
    setIsSaving(false);
    if (res.success) {
      onShowToast({
        type: 'success',
        message: 'Tarifario actualizado y sincronizado en Supabase',
      });
    } else {
      onShowToast({
        type: 'error',
        message: res.error || 'Error al guardar tarifario',
      });
    }
  };

  const handleToggleService = (id: string) => {
    const updatedServices = config.services.map((s) =>
      s.id === id ? { ...s, is_selected: !s.is_selected } : s
    );
    setConfig({ ...config, services: updatedServices });
  };

  const handleUpdateServicePrice = (id: string, newPrice: number) => {
    const updatedServices = config.services.map((s) =>
      s.id === id ? { ...s, price: Math.max(0, newPrice) } : s
    );
    setConfig({ ...config, services: updatedServices });
  };

  const handleUpdateServiceMinPrice = (id: string, minPrice: number) => {
    const updatedServices = config.services.map((s) =>
      s.id === id ? { ...s, min_price: Math.max(0, minPrice) } : s
    );
    setConfig({ ...config, services: updatedServices });
  };

  const handleDeleteService = (id: string) => {
    const updatedServices = config.services.filter((s) => s.id !== id);
    setConfig({ ...config, services: updatedServices });
    onShowToast({ type: 'info', message: 'Servicio eliminado del tarifario' });
  };

  const handleAddService = (category: WorkshopService['category']) => {
    if (!newServiceName.trim() || newServicePrice === '' || Number(newServicePrice) <= 0) {
      onShowToast({ type: 'error', message: 'Ingresa un nombre y precio válido para el servicio' });
      return;
    }

    const newService: WorkshopService = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      category,
      rate_mode: 'General',
      price: Number(newServicePrice),
      unit: newServiceUnit,
      min_price: newServiceMinPrice ? Number(newServiceMinPrice) : undefined,
      is_selected: true,
    };

    setConfig({
      ...config,
      services: [...config.services, newService],
    });

    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceMinPrice('');
    onShowToast({ type: 'success', message: `Nuevo concepto agregado a ${category}` });
  };

  const handleAddShippingZone = () => {
    if (!newZoneName.trim() || newZonePrice === '' || Number(newZonePrice) < 0) {
      onShowToast({ type: 'error', message: 'Ingresa un nombre y costo válido para la zona' });
      return;
    }

    const newZone: ShippingZone = {
      id: `zone-${Date.now()}`,
      name: newZoneName.trim(),
      price: Number(newZonePrice),
      unit: newZoneUnit,
    };

    setConfig({
      ...config,
      shipping_zones: [...config.shipping_zones, newZone],
    });

    setNewZoneName('');
    setNewZonePrice('');
    onShowToast({ type: 'success', message: 'Nueva zona de envío configurada' });
  };

  const handleDeleteZone = (id: string) => {
    setConfig({
      ...config,
      shipping_zones: config.shipping_zones.filter((z) => z.id !== id),
    });
    onShowToast({ type: 'info', message: 'Zona de logística eliminada' });
  };

  const tabs = [
    { id: 'preprensa' as TarifarioTab, label: 'Pre-prensa', icon: Layers, count: config.services.filter(s => s.category === 'preprensa').length },
    { id: 'produccion' as TarifarioTab, label: 'Producción', icon: Printer, count: config.machines.length },
    { id: 'recubrimiento' as TarifarioTab, label: 'Recubrimiento', icon: Sparkles, count: config.services.filter(s => s.category === 'recubrimientos').length },
    { id: 'acabados' as TarifarioTab, label: 'Acabados', icon: Scissors, count: config.services.filter(s => s.category === 'acabados').length },
    { id: 'logistica' as TarifarioTab, label: 'Logística', icon: Truck, count: config.shipping_zones.length },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#262422] font-heading">
              Tarifario Maestro
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#10B981] border border-emerald-200 text-[11px] font-extrabold uppercase tracking-wide">
              Supabase Sincronizado
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Parametriza costos unitarios, mermas y tarifas para cotizar con precisión quirúrgica
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Guardando en BD...' : 'Guardar Tarifario'}</span>
        </button>
      </div>

      {/* 5 Tabs Bar */}
      <div className="w-full bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#E9E4D9] shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-[550px] sm:min-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#10B981] shadow-xs border border-slate-200/80 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-emerald-100 text-emerald-800 font-black' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PRE-PRENSA */}
      {/* ========================================================================= */}
      {activeTab === 'preprensa' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Servicios de Pre-prensa y Diseño</h3>
                  <span className="text-xs text-slate-400 font-medium">Conceptos de preparación digital, pruebas Fogra y placas CTP</span>
                </div>
              </div>
            </div>

            {/* List of preprensa items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {config.services
                .filter((s) => s.category === 'preprensa')
                .map((srv) => (
                  <div
                    key={srv.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      srv.is_selected
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-black text-slate-800 block">{srv.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{srv.rate_mode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleService(srv.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                          srv.is_selected
                            ? 'bg-[#10B981] text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {srv.is_selected ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100/80">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Precio ($)</label>
                        <div className="relative mt-0.5">
                          <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            value={srv.price}
                            onChange={(e) => handleUpdateServicePrice(srv.id, Number(e.target.value))}
                            className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Unidad</label>
                        <span className="text-xs font-bold text-slate-700 block mt-1">{srv.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Form to add new Pre-prensa concept */}
            <div className="mt-4 p-5 bg-[#FAFBF9] rounded-2xl border border-slate-200/80 flex flex-col gap-3">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#10B981]" />
                Agregar Nuevo Concepto de Pre-prensa
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Ej. Revisión y armado de originales"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Precio ($)"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <select
                    value={newServiceUnit}
                    onChange={(e) => setNewServiceUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="por proyecto">por proyecto</option>
                    <option value="por hora">por hora</option>
                    <option value="por página">por página</option>
                    <option value="por placa">por placa</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleAddService('preprensa')}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Concepto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRODUCCIÓN */}
      {/* ========================================================================= */}
      {activeTab === 'produccion' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          {/* Parámetros de Guillotina y Merma Base */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Scissors className="w-5 h-5 text-[#10B981]" />
              <div>
                <h3 className="text-sm font-black text-slate-800">Parámetros de Guillotina y Merma</h3>
                <span className="text-xs text-slate-400 font-medium">Porcentajes automáticos aplicados al costeo de papel y refile</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">
                  Corte a máquina (% sobre costo papel)
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    value={config.company.press_cut_percent}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        company: { ...config.company, press_cut_percent: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-800"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">
                  Corte final en guillotina ($)
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    value={config.company.final_cut_price}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        company: { ...config.company, final_cut_price: Number(e.target.value) },
                      })
                    }
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">
                  Modo de corte final
                </label>
                <select
                  value={config.company.final_cut_mode}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      company: { ...config.company, final_cut_mode: e.target.value as any },
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="por_corte_millar">Por corte x millar</option>
                  <option value="por_proyecto">Por proyecto / lote fijo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tarifas de Máquinas del Taller */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Printer className="w-5 h-5 text-[#10B981]" />
              <div>
                <h3 className="text-sm font-black text-slate-800">Tarifas de Tiraje por Máquina</h3>
                <span className="text-xs text-slate-400 font-medium">Costos base por placa y millar o metro cuadrado</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.machines.map((m) => (
                <div key={m.id} className="p-4 bg-[#FAFBF9] rounded-2xl border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{m.name}</h4>
                      <span className="text-[11px] text-slate-400 font-medium">{m.sheet_size}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {m.machine_type || 'offset'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">Lámina / Placa ($)</label>
                      <div className="relative mt-1">
                        <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          value={m.plate_price}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = config.machines.map(mach => mach.id === m.id ? { ...mach, plate_price: val } : mach);
                            setConfig({ ...config, machines: updated });
                          }}
                          className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">Tiraje / {m.print_price_type === 'metro' ? 'm²' : 'millar'}</label>
                      <div className="relative mt-1">
                        <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          value={m.print_price}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = config.machines.map(mach => mach.id === m.id ? { ...mach, print_price: val } : mach);
                            setConfig({ ...config, machines: updated });
                          }}
                          className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-medium italic">
                    Mermas: {m.waste_ranges}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RECUBRIMIENTO */}
      {/* ========================================================================= */}
      {activeTab === 'recubrimiento' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Recubrimientos y Protección Superficial</h3>
                  <span className="text-xs text-slate-400 font-medium">Laminados térmicos, barnices UV, mate, brillo y a registro</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {config.services
                .filter((s) => s.category === 'recubrimientos')
                .map((srv) => (
                  <div
                    key={srv.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      srv.is_selected
                        ? 'border-amber-200 bg-amber-50/15'
                        : 'border-slate-200 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-black text-slate-800 leading-snug">{srv.name}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleService(srv.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer shrink-0 ${
                          srv.is_selected
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {srv.is_selected ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Precio</label>
                        <div className="relative mt-0.5">
                          <span className="absolute left-2 top-1 text-xs text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            value={srv.price}
                            onChange={(e) => handleUpdateServicePrice(srv.id, Number(e.target.value))}
                            className="w-full pl-5 pr-1 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-800"
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{srv.unit}</span>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Mínimo ($)</label>
                        <div className="relative mt-0.5">
                          <span className="absolute left-2 top-1 text-xs text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            value={srv.min_price || ''}
                            placeholder="0"
                            onChange={(e) => handleUpdateServiceMinPrice(srv.id, Number(e.target.value))}
                            className="w-full pl-5 pr-1 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-800"
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Arranque</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Form to add new Recubrimiento */}
            <div className="mt-4 p-5 bg-[#FAFBF9] rounded-2xl border border-slate-200/80 flex flex-col gap-3">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                Agregar Nuevo Recubrimiento
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Ej. Soft Touch Mate Aterciopelado"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Precio ($/m²)"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Mínimo arranque ($)"
                    value={newServiceMinPrice}
                    onChange={(e) => setNewServiceMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setNewServiceUnit('por m²');
                    handleAddService('recubrimientos');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Recubrimiento</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACABADOS */}
      {/* ========================================================================= */}
      {activeTab === 'acabados' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Acabados, Suajado y Encuadernación</h3>
                  <span className="text-xs text-slate-400 font-medium">Troquelado, doblado, plecado, hot stamping, folios y pegado</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {config.services
                .filter((s) => s.category === 'acabados' || s.category === 'editorial' || s.category === 'empaque')
                .map((srv) => (
                  <div
                    key={srv.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      srv.is_selected
                        ? 'border-purple-200 bg-purple-50/15'
                        : 'border-slate-200 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-black text-slate-800 leading-snug">{srv.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
                          {srv.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleService(srv.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer shrink-0 ${
                          srv.is_selected
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {srv.is_selected ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Tarifa</label>
                        <div className="relative mt-0.5">
                          <span className="absolute left-2 top-1 text-xs text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            value={srv.price}
                            onChange={(e) => handleUpdateServicePrice(srv.id, Number(e.target.value))}
                            className="w-full pl-5 pr-1 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Unidad</label>
                        <span className="text-xs font-bold text-slate-700 block mt-1.5">{srv.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Form to add new Acabado */}
            <div className="mt-4 p-5 bg-[#FAFBF9] rounded-2xl border border-slate-200/80 flex flex-col gap-3">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-purple-600" />
                Agregar Nuevo Acabado al Taller
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Ej. Ojillado metálico reforzado"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Tarifa ($)"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <select
                    value={newServiceUnit}
                    onChange={(e) => setNewServiceUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="por millar">por millar</option>
                    <option value="por pieza">por pieza</option>
                    <option value="por proyecto">por proyecto</option>
                    <option value="por m²">por m²</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleAddService('acabados')}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Acabado</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: LOGÍSTICA */}
      {/* ========================================================================= */}
      {activeTab === 'logistica' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          {/* Zonas de Envío */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Truck className="w-5 h-5 text-[#10B981]" />
              <div>
                <h3 className="text-sm font-black text-slate-800">Zonas de Envío y Distribución</h3>
                <span className="text-xs text-slate-400 font-medium">Tarifas de transporte por radio o cobertura</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {config.shipping_zones.map((zone) => (
                <div
                  key={zone.id}
                  className="p-4 bg-[#FAFBF9] rounded-2xl border border-slate-200 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{zone.name}</h4>
                      <span className="text-[11px] text-slate-400 font-medium">{zone.unit}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteZone(zone.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Costo de Envío</label>
                    <div className="relative mt-1">
                      <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        value={zone.price}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const updated = config.shipping_zones.map(z => z.id === zone.id ? { ...z, price: val } : z);
                          setConfig({ ...config, shipping_zones: updated });
                        }}
                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form to add new Shipping Zone */}
            <div className="mt-4 p-5 bg-[#FAFBF9] rounded-2xl border border-slate-200/80 flex flex-col gap-3">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#10B981]" />
                Nueva Zona de Envío
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre de la zona (ej. Zona Norte)"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Tarifa ($)"
                    value={newZonePrice}
                    onChange={(e) => setNewZonePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <select
                    value={newZoneUnit}
                    onChange={(e) => setNewZoneUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="/proyecto">/proyecto</option>
                    <option value="/envío">/envío</option>
                    <option value="/tarima">/tarima</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddShippingZone}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Zona</span>
                </button>
              </div>
            </div>
          </div>

          {/* Empaque y Embalaje */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Package className="w-5 h-5 text-[#10B981]" />
              <div>
                <h3 className="text-sm font-black text-slate-800">Servicios de Empaque y Embalaje</h3>
                <span className="text-xs text-slate-400 font-medium">Cajas de cartón, flejes, emplaye termosellado y esquineros</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {config.services
                .filter((s) => s.category === 'logistica')
                .map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-[#FAFBF9] flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-black text-slate-800">{srv.name}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleService(srv.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                          srv.is_selected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {srv.is_selected ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Precio</label>
                      <div className="relative mt-1">
                        <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          value={srv.price}
                          onChange={(e) => handleUpdateServicePrice(srv.id, Number(e.target.value))}
                          className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium mt-1 block">{srv.unit}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
