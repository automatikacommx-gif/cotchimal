import React, { useState, useEffect } from 'react';
import { PaperType, PaperGrammage } from '../../types';
import { settingsService } from '../../services/settingsService';
import { 
  FileText, 
  Plus, 
  Check, 
  X, 
  Search, 
  Edit2, 
  Trash2, 
  BookOpen, 
  Sparkles, 
  Package, 
  DollarSign, 
  CheckCircle2, 
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';

interface PapersViewProps {
  onShowToast: (toast: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

// Catálogo maestro de sustratos de referencia para la industria gráfica
const MASTER_CATALOG_PRESETS: PaperType[] = [
  {
    id: 'master-couche-bril',
    code: 'COU-B',
    name: 'Couché Brillante',
    description: 'Papel esmaltado de alta blancura y brillo reflectivo para volantes y revistas',
    selected: true,
    grammages: [
      { grammage: 130, price_per_thousand: 980, sheet_size: '70×100 cm' },
      { grammage: 150, price_per_thousand: 1120, sheet_size: '70×100 cm' },
      { grammage: 200, price_per_thousand: 1480, sheet_size: '70×100 cm' },
      { grammage: 250, price_per_thousand: 1850, sheet_size: '70×100 cm' },
      { grammage: 300, price_per_thousand: 2200, sheet_size: '70×100 cm' },
      { grammage: 350, price_per_thousand: 2650, sheet_size: '70×100 cm' },
    ],
  },
  {
    id: 'master-couche-mate',
    code: 'COU-M',
    name: 'Couché Mate',
    description: 'Papel recubierto sin reflejos, ideal para lectura editorial y acabados soft-touch',
    selected: true,
    grammages: [
      { grammage: 130, price_per_thousand: 1020, sheet_size: '70×100 cm' },
      { grammage: 150, price_per_thousand: 1180, sheet_size: '70×100 cm' },
      { grammage: 200, price_per_thousand: 1540, sheet_size: '70×100 cm' },
      { grammage: 250, price_per_thousand: 1920, sheet_size: '70×100 cm' },
      { grammage: 300, price_per_thousand: 2300, sheet_size: '70×100 cm' },
      { grammage: 350, price_per_thousand: 2780, sheet_size: '70×100 cm' },
    ],
  },
  {
    id: 'master-bond-blanco',
    code: 'BON-B',
    name: 'Bond Blanco',
    description: 'Sustrato no recubierto de alto anclaje para papelería institucional, facturas y libros',
    selected: true,
    grammages: [
      { grammage: 75, price_per_thousand: 520, sheet_size: '61×90 cm' },
      { grammage: 90, price_per_thousand: 620, sheet_size: '61×90 cm' },
      { grammage: 120, price_per_thousand: 840, sheet_size: '61×90 cm' },
    ],
  },
  {
    id: 'master-opalina',
    code: 'OPA-H',
    name: 'Opalina Holandesa',
    description: 'Cartulina lisa de grano fino y blancura premium para tarjetas y diplomas',
    selected: true,
    grammages: [
      { grammage: 120, price_per_thousand: 1100, sheet_size: '70×100 cm' },
      { grammage: 225, price_per_thousand: 1950, sheet_size: '70×100 cm' },
    ],
  },
  {
    id: 'master-sulfatada',
    code: 'SUL-1C',
    name: 'Cartulina Sulfatada 1 Cara',
    description: 'Cartulina rígida con recubrimiento brillante en el frente y reverso absorbente para empaque',
    selected: true,
    grammages: [
      { grammage: '12pts (240g)', price_per_thousand: 2150, sheet_size: '70×100 cm' },
      { grammage: '14pts (280g)', price_per_thousand: 2480, sheet_size: '70×100 cm' },
      { grammage: '16pts (320g)', price_per_thousand: 2850, sheet_size: '70×100 cm' },
      { grammage: '18pts (360g)', price_per_thousand: 3200, sheet_size: '70×100 cm' },
      { grammage: '24pts (450g)', price_per_thousand: 4100, sheet_size: '70×100 cm' },
    ],
  },
  {
    id: 'master-caple',
    code: 'CAP-RC',
    name: 'Cartulina Caple Reverso Café',
    description: 'Sustrato reciclado económico con cara blanca para cajas farmacéuticas y plegadizas',
    selected: false,
    grammages: [
      { grammage: '14pts (280g)', price_per_thousand: 1750, sheet_size: '70×100 cm' },
      { grammage: '16pts (320g)', price_per_thousand: 1980, sheet_size: '70×100 cm' },
      { grammage: '18pts (360g)', price_per_thousand: 2250, sheet_size: '70×100 cm' },
    ],
  },
  {
    id: 'master-lona-13oz',
    code: 'LON-13',
    name: 'Lona Frontlit 13oz',
    description: 'Bobina de PVC reforzada con malla de poliéster para gigantografías y pendones',
    selected: true,
    grammages: [
      { grammage: '13oz (440g)', price_per_thousand: 45, sheet_size: 'Ancho 1.60m a 3.20m' },
    ],
  },
  {
    id: 'master-vinil-adh',
    code: 'VIN-BL',
    name: 'Vinil Adhesivo Brillante',
    description: 'Película de PVC blanco con adhesivo acrílico permanente para rótulos y calcomanías',
    selected: true,
    grammages: [
      { grammage: '100 micras', price_per_thousand: 58, sheet_size: 'Bobina 1.52m' },
    ],
  },
];

export const PapersView: React.FC<PapersViewProps> = ({ onShowToast }) => {
  const [papers, setPapers] = useState<PaperType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modales
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isNewFamily, setIsNewFamily] = useState(true);

  // Edición / Creación de familia
  const [editingFamily, setEditingFamily] = useState<PaperType | null>(null);

  useEffect(() => {
    settingsService.getConfig().then((cfg) => setPapers(cfg.papers));
  }, []);

  const handleToggleFamily = async (id: string) => {
    const updated = papers.map((p) =>
      p.id === id ? { ...p, selected: !p.selected } : p
    );
    setPapers(updated);
    await settingsService.updatePapers(updated);
    onShowToast({
      type: 'success',
      message: 'Catálogo de papeles actualizado en Supabase',
    });
  };

  const handleDeleteFamily = async (id: string) => {
    const updated = papers.filter((p) => p.id !== id);
    setPapers(updated);
    await settingsService.updatePapers(updated);
    onShowToast({ type: 'info', message: 'Familia eliminada del taller' });
  };

  const handleOpenNewFamily = () => {
    setIsNewFamily(true);
    setEditingFamily({
      id: `p-${Date.now()}`,
      code: '',
      name: '',
      description: '',
      selected: true,
      grammages: [
        { grammage: 130, price_per_thousand: 950, sheet_size: '70×100 cm' },
      ],
    });
    setIsFamilyModalOpen(true);
  };

  const handleOpenEditFamily = (p: PaperType) => {
    setIsNewFamily(false);
    setEditingFamily(JSON.parse(JSON.stringify(p)));
    setIsFamilyModalOpen(true);
  };

  const handleAddGrammageRow = () => {
    if (!editingFamily) return;
    const newG: PaperGrammage = {
      grammage: 150,
      price_per_thousand: 1100,
      sheet_size: '70×100 cm',
    };
    setEditingFamily({
      ...editingFamily,
      grammages: [...editingFamily.grammages, newG],
    });
  };

  const handleRemoveGrammageRow = (index: number) => {
    if (!editingFamily) return;
    if (editingFamily.grammages.length <= 1) {
      onShowToast({ type: 'error', message: 'Una familia debe tener al menos un gramaje' });
      return;
    }
    const updated = editingFamily.grammages.filter((_, i) => i !== index);
    setEditingFamily({ ...editingFamily, grammages: updated });
  };

  const handleSaveFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFamily) return;

    if (!editingFamily.name.trim() || !editingFamily.code.trim()) {
      onShowToast({ type: 'error', message: 'El código y el nombre son requeridos' });
      return;
    }

    let updated: PaperType[];
    if (papers.some((p) => p.id === editingFamily.id)) {
      updated = papers.map((p) => (p.id === editingFamily.id ? editingFamily : p));
    } else {
      updated = [...papers, editingFamily];
    }

    setPapers(updated);
    await settingsService.updatePapers(updated);
    setIsFamilyModalOpen(false);
    setEditingFamily(null);
    onShowToast({
      type: 'success',
      message: isNewFamily ? 'Familia de papel agregada' : 'Familia actualizada correctamente',
    });
  };

  const handleImportFromMaster = async (masterPaper: PaperType) => {
    if (papers.some((p) => p.code === masterPaper.code)) {
      onShowToast({
        type: 'info',
        message: `La familia ${masterPaper.name} (${masterPaper.code}) ya existe en tu taller`,
      });
      return;
    }

    const newPaper: PaperType = {
      ...masterPaper,
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      selected: true,
    };

    const updated = [...papers, newPaper];
    setPapers(updated);
    await settingsService.updatePapers(updated);
    onShowToast({
      type: 'success',
      message: `${masterPaper.name} importado al taller desde el catálogo maestro`,
    });
  };

  const filteredPapers = papers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#262422] font-heading">
              Catálogo de Papeles y Sustratos
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#10B981] border border-emerald-200 text-[11px] font-extrabold uppercase tracking-wide">
              {papers.filter((p) => p.selected).length} Activos
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Gestión de familias de sustratos, calibres, gramajes y precios por pliego y millar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCatalogModalOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#10B981]" />
            <span>Catálogo Maestro</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewFamily}
            className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Familia</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o gramaje..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#10B981]"
          />
        </div>
      </div>

      {/* Grid of Paper Families */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPapers.map((p) => (
          <div
            key={p.id}
            className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between gap-4 ${
              p.selected
                ? 'border-[#10B981] bg-white shadow-2xs hover:shadow-xs'
                : 'border-slate-200 bg-slate-50/70 opacity-60'
            }`}
          >
            <div className="flex flex-col gap-3">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-xl tracking-wider ${
                      p.selected
                        ? 'bg-[#DCFCE7] text-[#10B981]'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {p.code}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">
                      {p.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium line-clamp-1">
                      {p.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleFamily(p.id)}
                    title={p.selected ? 'Desactivar papel' : 'Activar papel'}
                    className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer transition-colors ${
                      p.selected
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {p.selected ? 'Activo' : 'Inactivo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditFamily(p)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                    title="Editar familia y gramajes"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFamily(p.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                    title="Eliminar familia"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grammages list */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Gramajes & Precios Registrados ({p.grammages.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {p.grammages.map((g, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-[#FAFBF9] rounded-xl border border-slate-200/80 flex flex-col gap-0.5 text-xs"
                    >
                      <span className="font-black text-slate-800">
                        {typeof g.grammage === 'number' ? `${g.grammage}g` : g.grammage}
                      </span>
                      <span className="text-[11px] font-bold text-[#10B981]">
                        ${g.price_per_thousand} {g.sheet_size?.includes('m') ? '/m²' : '/mil'}
                      </span>
                      {g.sheet_size && (
                        <span className="text-[9px] text-slate-400 truncate">
                          {g.sheet_size}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CATÁLOGO MAESTRO DE REFERENCIA */}
      {/* ========================================================================= */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col gap-5 max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#262422]">
                    Catálogo Maestro de Sustratos
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    Papeles y materiales estándar preconfigurados con precios de mercado
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1">
              {MASTER_CATALOG_PRESETS.map((preset) => {
                const alreadyAdded = papers.some((p) => p.code === preset.code);
                return (
                  <div
                    key={preset.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-[#FAFBF9] flex items-center justify-between gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {preset.code}
                        </span>
                        <h4 className="text-sm font-black text-slate-900">{preset.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 max-w-md">
                        {preset.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {preset.grammages.slice(0, 4).map((g, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            {typeof g.grammage === 'number' ? `${g.grammage}g` : g.grammage}
                          </span>
                        ))}
                        {preset.grammages.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{preset.grammages.length - 4} más
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleImportFromMaster(preset)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer transition-all ${
                        alreadyAdded
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-[#10B981] hover:bg-[#059669] text-white shadow-xs'
                      }`}
                    >
                      {alreadyAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>En Taller</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Importar</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Cerrar Catálogo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NUEVA FAMILIA / EDITAR FAMILIA DE PAPEL */}
      {/* ========================================================================= */}
      {isFamilyModalOpen && editingFamily && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl flex flex-col gap-5 max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#262422]">
                  {isNewFamily ? 'Nueva Familia de Papel' : 'Editar Familia de Papel'}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Define código, nombre, calibres y costos por millar
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFamilyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFamily} className="space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Código
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. COU-B"
                    value={editingFamily.code}
                    onChange={(e) =>
                      setEditingFamily({ ...editingFamily, code: e.target.value.toUpperCase() })
                    }
                    className="w-full mt-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Nombre de la Familia
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Couché Mate Importado"
                    value={editingFamily.name}
                    onChange={(e) =>
                      setEditingFamily({ ...editingFamily, name: e.target.value })
                    }
                    className="w-full mt-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">
                  Descripción o Usos Recomendados
                </label>
                <input
                  type="text"
                  placeholder="Ej. Papel satinado para catálogos de arte y revistas"
                  value={editingFamily.description}
                  onChange={(e) =>
                    setEditingFamily({ ...editingFamily, description: e.target.value })
                  }
                  className="w-full mt-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>

              {/* Dynamic Grammage Rows */}
              <div className="pt-2 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                    Gramajes / Calibres de esta Familia
                  </label>
                  <button
                    type="button"
                    onClick={handleAddGrammageRow}
                    className="text-xs font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Gramaje</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editingFamily.grammages.map((g, index) => (
                    <div
                      key={index}
                      className="p-3 bg-[#FAFBF9] rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-7 gap-2 items-center text-xs"
                    >
                      <div className="sm:col-span-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block">Gramaje</label>
                        <input
                          type="text"
                          required
                          placeholder="130 o 14pts"
                          value={g.grammage}
                          onChange={(e) => {
                            const val = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                            const updated = [...editingFamily.grammages];
                            updated[index].grammage = val;
                            setEditingFamily({ ...editingFamily, grammages: updated });
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block">Precio ($)</label>
                        <input
                          type="number"
                          required
                          placeholder="950"
                          value={g.price_per_thousand}
                          onChange={(e) => {
                            const updated = [...editingFamily.grammages];
                            updated[index].price_per_thousand = Number(e.target.value);
                            setEditingFamily({ ...editingFamily, grammages: updated });
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block">Formato Pliego</label>
                        <input
                          type="text"
                          placeholder="70×100 cm"
                          value={g.sheet_size || ''}
                          onChange={(e) => {
                            const updated = [...editingFamily.grammages];
                            updated[index].sheet_size = e.target.value;
                            setEditingFamily({ ...editingFamily, grammages: updated });
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                        />
                      </div>

                      <div className="flex justify-end sm:justify-center pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveGrammageRow(index)}
                          className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="paper_active_checkbox"
                  checked={editingFamily.selected}
                  onChange={(e) =>
                    setEditingFamily({ ...editingFamily, selected: e.target.checked })
                  }
                  className="w-4 h-4 text-[#10B981] rounded border-slate-300 focus:ring-[#10B981]"
                />
                <label
                  htmlFor="paper_active_checkbox"
                  className="text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Familia activa disponible para cotizaciones
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFamilyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-black text-white shadow-xs cursor-pointer transition-all"
                >
                  {isNewFamily ? 'Crear Familia' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
