import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Client, ProjectType, Quote, QuoteItem, OnboardingFullConfig } from '../../types';
import { quoteService } from '../../services/quoteService';
import { settingsService } from '../../services/settingsService';
import {
  calculationService,
  GeneralCalculationResult,
  PackagingCalculationResult,
} from '../../services/calculationService';
import { UnsavedChangesModal } from './UnsavedChangesModal';
import { 
  Calculator, 
  Check, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Package, 
  BookOpen, 
  Maximize2, 
  Zap, 
  Info, 
  DollarSign, 
  Percent, 
  Save, 
  Calendar,
  Sparkles,
  LayoutGrid,
  TrendingDown,
  AlertCircle,
  Printer,
  Scissors,
  HelpCircle
} from 'lucide-react';

interface OffsetWasteCardProps {
  calc: GeneralCalculationResult;
  quantity: number;
  offsetInks: string;
}

const OffsetWasteCard = React.memo<OffsetWasteCardProps>(({ calc, quantity, offsetInks }) => {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F4FDF7] to-[#EDF9F2] border border-[#10B981]/25 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
          <Printer className="w-4 h-4 text-[#10B981]" />
          <span>Cálculo de Merma & Insumos Offset (Estándar Printara)</span>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#10B981]/20 text-[#059669]">
          {calc.piecesPerSheet} piezas / pliego
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Pliegos Netos</span>
          <span className="text-sm sm:text-base font-black text-slate-800 font-mono mt-0.5">
            {calc.netSheets}
          </span>
          <span className="text-[9px] text-slate-400">{quantity} pzas requeridas</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Merma Arranque</span>
          <span className="text-sm sm:text-base font-black text-amber-600 font-mono mt-0.5">
            +{calc.setupWasteSheets}
          </span>
          <span className="text-[9px] text-slate-400">Puesta a punto registro</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Merma Tiro + Acabados</span>
          <span className="text-sm sm:text-base font-black text-amber-600 font-mono mt-0.5">
            +{calc.runWasteSheets + calc.finishingWasteSheets}
          </span>
          <span className="text-[9px] text-slate-400">3% tiro + procesos</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex flex-col">
          <span className="text-[10px] font-black text-[#065F46] uppercase">Pliegos Brutos</span>
          <span className="text-sm sm:text-base font-black text-[#047857] font-mono mt-0.5">
            {calc.grossSheets}
          </span>
          <span className="text-[9px] font-bold text-[#059669]">
            {calc.wastePercent}% merma total
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-emerald-200/50">
        <span>
          <strong>Preprensa:</strong> {calc.plates} placas térmicas CTP ({offsetInks})
        </span>
        <span>
          <strong>Costo papel estimado:</strong> ${calc.totalPaperCost.toFixed(2)} MXN
        </span>
      </div>
    </div>
  );
});

interface PackagingEngineeringCardProps {
  calc: PackagingCalculationResult;
  quantity: number;
}

const PackagingEngineeringCard = React.memo<PackagingEngineeringCardProps>(({ calc, quantity }) => {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F4FDF7] to-[#EDF9F2] border border-[#10B981]/25 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
          <Scissors className="w-4 h-4 text-[#10B981]" />
          <span>Ingeniería de Troquel & Desarrollo Extendido (Printara)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#10B981]/20 text-[#059669]">
            {calc.imposition.piecesPerSheet} cajas / pliego ({calc.imposition.isRotated ? 'Girada 90°' : 'Normal'})
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            {calc.imposition.sheetUtilizationPercent}% útil
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Desarrollo Plano</span>
          <span className="text-xs sm:text-sm font-black text-slate-800 font-mono mt-0.5">
            {calc.boxFlat.flatWidthCm} × {calc.boxFlat.flatHeightCm} cm
          </span>
          <span className="text-[9px] text-slate-400">Pestaña: {calc.boxFlat.glueFlapCm} cm</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Pliegos Netos</span>
          <span className="text-sm sm:text-base font-black text-slate-800 font-mono mt-0.5">
            {calc.netSheets}
          </span>
          <span className="text-[9px] text-slate-400">{quantity} cajas requeridas</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Cuchilla en Suaje</span>
          <span className="text-xs sm:text-sm font-black text-slate-800 font-mono mt-0.5">
            {(calc.boxFlat.totalRuleMeters * calc.imposition.piecesPerSheet).toFixed(1)} m
          </span>
          <span className="text-[9px] text-slate-400">Corte + Plecas en pliego</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex flex-col">
          <span className="text-[10px] font-black text-[#065F46] uppercase">Pliegos Brutos</span>
          <span className="text-sm sm:text-base font-black text-[#047857] font-mono mt-0.5">
            {calc.grossSheets}
          </span>
          <span className="text-[9px] font-bold text-[#059669]">
            {calc.waste.wastePercent}% merma total
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-emerald-200/50 gap-1">
        <span>
          <strong>Troquel Láser:</strong> {calc.dieManufacturingCost > 0 ? `$${calc.dieManufacturingCost.toFixed(2)} MXN (Nuevo)` : 'Sin costo (Suaje existente)'}
        </span>
        <span>
          <strong>Procesos incluidos:</strong> Impresión + Troquelado + Pegado mecanizado
        </span>
      </div>
    </div>
  );
});

interface QuoteWizardProps {
  clients: Client[];
  initialClient?: Client | null;
  onQuoteCreated: (quote: Quote) => void;
  onCancel: () => void;
  onShowNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
  onOpenImposition?: () => void;
  onConfigureMachines?: () => void;
  onConfigureSubstrates?: () => void;
  onConfigureClients?: () => void;
  onViewConfigSummary?: () => void;
}

export const QuoteWizard: React.FC<QuoteWizardProps> = ({
  clients,
  initialClient,
  onQuoteCreated,
  onCancel,
  onShowNotification,
  onOpenImposition,
  onConfigureMachines,
  onConfigureSubstrates,
  onConfigureClients,
  onViewConfigSummary,
}) => {
  // Estado de vista: 'form' (especificaciones) o 'review' (desglose de cálculo y costeo)
  const [viewMode, setViewMode] = useState<'form' | 'review'>('form');

  // Tipo de proyecto activo
  const [projectType, setProjectType] = useState<ProjectType>('general');

  // Configuración dinámica desde Supabase
  const [config, setConfig] = useState<OnboardingFullConfig | null>(null);

  useEffect(() => {
    settingsService.getConfig().then(setConfig);
  }, []);

  // Modal de cambios sin guardar
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  // Campos comunes
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClient?.id || (clients[0]?.id || '')
  );
  const [projectTitle, setProjectTitle] = useState('');
  const [quantity, setQuantity] = useState<number>(1000);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [material, setMaterial] = useState('');
  const [observations, setObservations] = useState('');

  // ==========================================
  // CAMPOS ESPECÍFICOS: GENERAL (Image 1)
  // ==========================================
  const [generalSize, setGeneralSize] = useState<'Carta' | 'Media carta' | '1/4 carta' | '1/8 carta' | 'Personalizado'>('Carta');
  const [generalCustomWidth, setGeneralCustomWidth] = useState<number>(21.5);
  const [generalCustomHeight, setGeneralCustomHeight] = useState<number>(28);
  const [generalPaperType, setGeneralPaperType] = useState('Couché brillante');
  const [generalGrammage, setGeneralGrammage] = useState('130g');
  // Parámetros Offset y Estándar Printara México
  const [offsetInks, setOffsetInks] = useState<'4/0' | '4/4' | '1/0' | '1/1' | '4/1'>('4/0');
  const [offsetLamination, setOffsetLamination] = useState<'none' | 'mate_1c' | 'mate_2c' | 'brillo_1c' | 'brillo_2c'>('none');
  const [offsetVarnish, setOffsetVarnish] = useState<'none' | 'maquina' | 'uv_registro'>('maquina');
  const [offsetFolding, setOffsetFolding] = useState<'none' | 'diptico' | 'triptico'>('none');

  // ==========================================
  // CAMPOS ESPECÍFICOS: EDITORIAL (Image 2)
  // ==========================================
  const [editorialSize, setEditorialSize] = useState<'Carta' | 'Media carta' | '1/4 carta' | '1/8 carta' | 'Personalizado'>('Media carta');
  const [editorialSpineCm, setEditorialSpineCm] = useState<number>(0.8);
  const [editorialFlapCm, setEditorialFlapCm] = useState<number>(7.0);
  const [editorialPaperType, setEditorialPaperType] = useState('Couché mate');
  const [editorialGrammage, setEditorialGrammage] = useState('150g');
  const [editorialPages, setEditorialPages] = useState<number>(48);

  // ==========================================
  // CAMPOS ESPECÍFICOS: EMPAQUE (Image 3)
  // ==========================================
  const [boxType, setBoxType] = useState<'lineal' | 'automatico' | 'semi_automatico'>('lineal');
  const [boxLengthCm, setBoxLengthCm] = useState<number>(12);
  const [boxWidthCm, setBoxWidthCm] = useState<number>(8);
  const [boxHeightCm, setBoxHeightCm] = useState<number>(15);
  const [boxSubstrate, setBoxSubstrate] = useState('Cartulina Sulfatada 16pts');
  const [boxInks, setBoxInks] = useState<'4/0' | '4/4' | '1/0' | 'directas' | 'sin_impresion'>('4/0');
  const [boxFinish, setBoxFinish] = useState<'none' | 'barniz_maquina' | 'uv_registro' | 'plastificado_mate' | 'plastificado_brillante'>('barniz_maquina');
  const [boxHasExistingDie, setBoxHasExistingDie] = useState<boolean>(false);
  const [boxSheetSize, setBoxSheetSize] = useState<'70x95' | '61x86' | '72x102'>('70x95');

  // ==========================================
  // CAMPOS ESPECÍFICOS: GRAN FORMATO (Requisito 1)
  // ==========================================
  const [gfSubstrate, setGfSubstrate] = useState('Lona Frontlit 13oz');
  const [gfWidthM, setGfWidthM] = useState<number>(2.5);
  const [gfHeightM, setGfHeightM] = useState<number>(1.2);
  const [gfDpi, setGfDpi] = useState<'720' | '1440' | '2880'>('1440');
  const [gfInkType, setGfInkType] = useState<'eco_solvente' | 'solvente' | 'uv' | 'latex'>('eco_solvente');
  const [gfFinishes, setGfFinishes] = useState<string[]>(['Dobladillo perimetral', 'Ojillos perimetrales cada 50cm']);
  const [gfWastePercent, setGfWastePercent] = useState<number>(5);

  // Partidas dinámicas
  const [items, setItems] = useState<Omit<QuoteItem, 'id' | 'quote_id'>[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detección de cambios sin guardar (Memoizado para no recalcular strings en cada render)
  const isDirty = useMemo(() => Boolean(
    projectTitle.trim() ||
    material.trim() ||
    observations.trim() ||
    (quantity !== 1000 && quantity > 0) ||
    items.length > 0 ||
    generalPaperType !== 'Couché brillante' ||
    editorialSpineCm !== 0.8 ||
    boxType !== 'lineal' ||
    gfSubstrate !== 'Lona Frontlit 13oz'
  ), [projectTitle, material, observations, quantity, items.length, generalPaperType, editorialSpineCm, boxType, gfSubstrate]);

  // Estimación y desglose de merma e insumos offset memoizados
  const offsetCalculations = useMemo((): GeneralCalculationResult | null => {
    if (projectType !== 'general') return null;
    return calculationService.calculateGeneral(
      {
        size: generalSize,
        customWidth: Number(generalCustomWidth) || 21.5,
        customHeight: Number(generalCustomHeight) || 28,
        paperType: generalPaperType,
        grammage: generalGrammage,
        quantity: Number(quantity) || 1000,
        offsetInks,
        offsetLamination,
        offsetVarnish,
        offsetFolding,
      },
      config
    );
  }, [
    projectType,
    generalSize,
    generalCustomWidth,
    generalCustomHeight,
    generalPaperType,
    generalGrammage,
    quantity,
    offsetInks,
    offsetLamination,
    offsetVarnish,
    offsetFolding,
    config,
  ]);

  // Cálculo de empaque memoizado (se ejecuta SOLO al cambiar variables de empaque)
  const packagingCalculations = useMemo((): PackagingCalculationResult | null => {
    if (projectType !== 'empaque') return null;
    return calculationService.calculateEmpaqueDetailed(
      {
        boxType,
        lengthCm: Number(boxLengthCm) || 12,
        widthCm: Number(boxWidthCm) || 8,
        heightCm: Number(boxHeightCm) || 15,
        substrate: boxSubstrate,
        quantity: Number(quantity) || 1000,
        inks: boxInks,
        finish: boxFinish,
        hasExistingDie: boxHasExistingDie,
        sheetSize: boxSheetSize,
      },
      config
    );
  }, [
    projectType,
    boxType,
    boxLengthCm,
    boxWidthCm,
    boxHeightCm,
    boxSubstrate,
    quantity,
    boxInks,
    boxFinish,
    boxHasExistingDie,
    boxSheetSize,
    config,
  ]);

  // Generar partidas calculadas según la línea (Callback estable)
  const generateCalculatedItems = useCallback(() => {
    let newItems: Omit<QuoteItem, 'id' | 'quote_id'>[] = [];

    if (projectType === 'general') {
      const calc = offsetCalculations || calculationService.calculateGeneral(
        {
          size: generalSize,
          customWidth: Number(generalCustomWidth) || 21.5,
          customHeight: Number(generalCustomHeight) || 28,
          paperType: generalPaperType,
          grammage: generalGrammage,
          quantity: Number(quantity) || 1000,
          offsetInks,
          offsetLamination,
          offsetVarnish,
          offsetFolding,
        },
        config
      );
      newItems = calc.items;
    } else if (projectType === 'editorial') {
      newItems = calculationService.calculateEditorial(
        {
          size: editorialSize,
          pages: editorialPages,
          spineCm: editorialSpineCm,
          flapCm: editorialFlapCm,
          coverPaperType: editorialPaperType,
          coverGrammage: editorialGrammage,
          quantity: Number(quantity) || 1000,
        },
        config
      );
    } else if (projectType === 'empaque') {
      const calc = packagingCalculations || calculationService.calculateEmpaqueDetailed(
        {
          boxType,
          lengthCm: Number(boxLengthCm) || 12,
          widthCm: Number(boxWidthCm) || 8,
          heightCm: Number(boxHeightCm) || 15,
          substrate: boxSubstrate,
          quantity: Number(quantity) || 1000,
          inks: boxInks,
          finish: boxFinish,
          hasExistingDie: boxHasExistingDie,
          sheetSize: boxSheetSize,
        },
        config
      );
      newItems = calc.items;
    } else {
      // Gran Formato
      newItems = calculationService.calculateGranFormato(
        {
          substrate: gfSubstrate,
          widthM: gfWidthM,
          heightM: gfHeightM,
          quantity: Number(quantity) || 1,
          dpi: gfDpi,
          inkType: gfInkType,
          finishes: gfFinishes,
          wastePercent: gfWastePercent,
        },
        config
      );
    }

    setItems(newItems);
    setViewMode('review');
  }, [
    projectType,
    offsetCalculations,
    packagingCalculations,
    generalSize,
    generalCustomWidth,
    generalCustomHeight,
    generalPaperType,
    generalGrammage,
    quantity,
    offsetInks,
    offsetLamination,
    offsetVarnish,
    offsetFolding,
    editorialSize,
    editorialPages,
    editorialSpineCm,
    editorialFlapCm,
    editorialPaperType,
    editorialGrammage,
    boxType,
    boxLengthCm,
    boxWidthCm,
    boxHeightCm,
    boxSubstrate,
    boxInks,
    boxFinish,
    boxHasExistingDie,
    boxSheetSize,
    gfSubstrate,
    gfWidthM,
    gfHeightM,
    gfDpi,
    gfInkType,
    gfFinishes,
    gfWastePercent,
    config,
  ]);

  // Cálculos financieros en tiempo real (Memoizados)
  const { rawSubtotal, discountAmount, taxableAmount, taxRate, taxAmount, total } = useMemo(() => {
    const raw = items.reduce((sum, it) => sum + Number(it.subtotal || 0), 0);
    const disc = (raw * Number(discountPercent || 0)) / 100;
    const taxable = Math.max(0, raw - disc);
    const rate = 16.0;
    const tax = (taxable * rate) / 100;
    const tot = taxable + tax;
    return {
      rawSubtotal: raw,
      discountAmount: disc,
      taxableAmount: taxable,
      taxRate: rate,
      taxAmount: tax,
      total: tot,
    };
  }, [items, discountPercent]);

  // Interceptar navegación cuando hay cambios
  const attemptNavigation = (action: () => void) => {
    if (isDirty) {
      setPendingNavigation(() => action);
      setShowUnsavedModal(true);
    } else {
      action();
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedModal(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    } else {
      onCancel();
    }
  };

  const handleSaveDraft = async () => {
    setShowUnsavedModal(false);
    await handleSaveQuote(true);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleSaveQuote = async (isDraft = false) => {
    if (!selectedClientId) {
      onShowNotification('Por favor selecciona un cliente registrado', 'error');
      return;
    }

    const titleToSave = projectTitle.trim() || `Proyecto ${projectType.toUpperCase()} - ${new Date().toLocaleDateString('es-MX')}`;

    setIsSubmitting(true);
    try {
      const quotePayload = {
        client_id: selectedClientId,
        project_title: titleToSave,
        project_type: projectType,
        status: (isDraft ? 'borrador' : 'enviada') as any,
        subtotal: Number(taxableAmount.toFixed(2)),
        tax_rate: taxRate,
        tax_amount: Number(taxAmount.toFixed(2)),
        discount_amount: Number(discountAmount.toFixed(2)),
        total: Number(total.toFixed(2)),
        currency: 'MXN',
        valid_until: validUntil,
        technical_notes: [
          technicalNotes.trim(),
          material.trim() ? `Material: ${material.trim()}` : '',
          observations.trim() ? `Observaciones: ${observations.trim()}` : '',
        ].filter(Boolean).join(' | ') || `Cotizado bajo línea ${projectType}`,
        material: material.trim() || undefined,
        observations: observations.trim() || undefined,
      };

      const finalItems = items.length > 0 ? items : [
        {
          description: `Partida ${projectType}`,
          quantity,
          unit: 'Pza',
          unit_price: 10,
          substrate_finishing: 'Estándar',
          subtotal: quantity * 10,
        }
      ];

      const { data, error } = await quoteService.createQuote(quotePayload, finalItems);

      if (error || !data) {
        throw new Error(error || 'No se pudo guardar la cotización');
      }

      onShowNotification(
        isDraft
          ? `Borrador ${data.quote_number} guardado con éxito`
          : `Cotización ${data.quote_number} generada y guardada en Supabase`,
        'success'
      );
      onQuoteCreated(data);
    } catch (err: any) {
      onShowNotification(err.message || 'Error al guardar cotización', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const productionLines = [
    {
      id: 'general' as const,
      title: 'General',
      subtitle: 'Comercial & Publicitario',
      tagline: 'Volantes, folletos, trípticos y papelería corporativa',
      icon: Layers,
      capabilities: [
        { label: 'Formatos', val: 'Hasta 71×102 cm (Offset) / 33×48 cm (Digital)' },
        { label: 'Sustratos', val: 'Couché 130g–350g, Bond 75g–120g, Opalina' },
        { label: 'Capacidad', val: 'Desde 100 hasta 500,000+ pliegos' },
      ],
      finishes: ['Barniz Máquina', 'Laminado Mate/Brillo', 'Doblado', 'Foliado', 'Refile'],
    },
    {
      id: 'editorial' as const,
      title: 'Editorial',
      subtitle: 'Libros, Revistas & Catálogos',
      tagline: 'Publicaciones encuadernadas con lomo y páginas interiores',
      icon: BookOpen,
      capabilities: [
        { label: 'Formatos', val: 'Carta, Media carta y dimensiones a la medida' },
        { label: 'Lomo & Solapas', val: 'Lomo 0.3 a 4.5 cm con solapas hasta 12cm' },
        { label: 'Interiores', val: 'Desde 8 hasta 500+ páginas' },
      ],
      finishes: ['Pegado Hotmelt', 'Solapas', 'Cosido', 'Barniz a registro UV', 'Laminado'],
    },
    {
      id: 'empaque' as const,
      title: 'Empaque',
      subtitle: 'Cajas & Packaging Plegadizo',
      tagline: 'Cajas farmacéuticas, cosméticas, alimentarias y display',
      icon: Package,
      capabilities: [
        { label: 'Estructuras', val: 'Lineal, Fondo automático, Semiautomático' },
        { label: 'Sustratos', val: 'Sulfatada 12–24pts, Microcorrugado Flauta E/F' },
        { label: 'Procesos', val: 'Troquelado y plecado computarizado' },
      ],
      finishes: ['Suajado', 'Plecado', 'Pegado de caja', 'Ventana PVC', 'Hot stamping'],
    },
    {
      id: 'gran_formato' as const,
      title: 'Gran Formato',
      subtitle: 'Gigantografías & Rígidos',
      tagline: 'Lonas publicitarias, viniles, pendones y paneles rígidos',
      icon: Maximize2,
      capabilities: [
        { label: 'Formatos', val: 'Bobinas hasta 3.20m de ancho continuo' },
        { label: 'Sustratos', val: 'Lona Frontlit 13oz, Backlit, Vinil, Coroplast' },
        { label: 'Resolución', val: '720 / 1440 / 2880 DPI alta fidelidad' },
      ],
      finishes: ['Dobladillo perimetral', 'Ojillos metálicos', 'Tinta UV/Eco', 'Montaje'],
    },
  ];

  const hasMachines = Boolean(config && config.machines && config.machines.length > 0);
  const hasSubstrates = Boolean(
    config &&
      config.papers &&
      config.papers.some((p) => p.grammages && p.grammages.length > 0)
  );
  const hasClients = Boolean(clients && clients.length > 0);
  const canQuote = hasMachines && hasSubstrates && hasClients;

  if (config && !canQuote) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#DEE4DF] shadow-sm flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-[#D9531E] flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
              Configuración requerida para cotizar
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Para poder generar una cotización real con costos exactos, necesitas tener configurados los siguientes 3 elementos en tu taller:
            </p>
          </div>

          <div className="w-full flex flex-col gap-3 text-left">
            {/* 1. Máquina configurada */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAF8] border border-[#DEE4DF]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    hasMachines
                      ? 'bg-[#D1E7DD] text-[#0F5132]'
                      : 'bg-amber-100 text-[#D9531E]'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                    1. Máquina configurada
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {hasMachines
                      ? `${config.machines.length} máquina(s) lista(s)`
                      : 'No se agregaron máquinas en el taller'}
                  </span>
                </div>
              </div>

              {hasMachines ? (
                <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#198754] text-xs font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Lista
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onConfigureMachines}
                  className="px-4 py-2 rounded-xl bg-[#198754] hover:bg-[#0F5132] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Configurar máquinas
                </button>
              )}
            </div>

            {/* 2. Sustratos y gramajes */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAF8] border border-[#DEE4DF]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    hasSubstrates
                      ? 'bg-[#D1E7DD] text-[#0F5132]'
                      : 'bg-amber-100 text-[#D9531E]'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                    2. Sustratos y gramajes configurados
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {hasSubstrates
                      ? 'Papeles y gramajes con precio configurados'
                      : 'No se configuraron sustratos ni gramajes'}
                  </span>
                </div>
              </div>

              {hasSubstrates ? (
                <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#198754] text-xs font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Listos
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onConfigureSubstrates}
                  className="px-4 py-2 rounded-xl bg-[#198754] hover:bg-[#0F5132] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Configurar sustratos
                </button>
              )}
            </div>

            {/* 3. Clientes */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAF8] border border-[#DEE4DF]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    hasClients
                      ? 'bg-[#D1E7DD] text-[#0F5132]'
                      : 'bg-amber-100 text-[#D9531E]'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                    3. Clientes registrados
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {hasClients
                      ? `${clients.length} cliente(s) disponible(s)`
                      : 'Debes tener al menos un cliente para cotizar'}
                  </span>
                </div>
              </div>

              {hasClients ? (
                <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#198754] text-xs font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Listos
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onConfigureClients}
                  className="px-4 py-2 rounded-xl bg-[#198754] hover:bg-[#0F5132] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Agregar cliente
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
            {onViewConfigSummary && (
              <button
                type="button"
                onClick={onViewConfigSummary}
                className="px-6 py-3 rounded-xl bg-[#0F5132] hover:bg-[#198754] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                Ir al resumen de configuración
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl bg-[#F8FAF8] hover:bg-[#EFF5F0] border border-[#DEE4DF] text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              Volver a Resumen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-20 gap-6 max-w-4xl mx-auto">
      {/* Unsaved Changes Modal matching Image 4 */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onDiscard={handleDiscardChanges}
        onSaveDraft={handleSaveDraft}
        isSaving={isSubmitting}
      />

      {/* Responsive Production Lines Comparison Grid (Clean layout for desktop, tablet, and mobile without scrollbar arrows) */}
      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#10B981]" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Líneas de Producción y Capacidades de Taller
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Selección ágil · Formatos y acabados de planta
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 w-full">
          {productionLines.map((line) => {
            const isActive = projectType === line.id;
            const Icon = line.icon;
            return (
              <div
                key={line.id}
                onClick={() => {
                  if (isActive) return;
                  attemptNavigation(() => {
                    setProjectType(line.id);
                    setViewMode('form');
                  });
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 text-left ${
                  isActive
                    ? 'border-[#10B981] bg-[#F4FDF7] shadow-xs ring-2 ring-[#10B981]/15'
                    : 'border-slate-200 bg-white hover:border-[#10B981]/60 hover:shadow-2xs'
                }`}
              >
                <div className="flex flex-col gap-2.5">
                  {/* Header: Icon, Name & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-[#10B981] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-900 leading-tight truncate">
                          {line.title}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 block truncate">
                          {line.subtitle}
                        </span>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] text-[10px] font-black shrink-0 whitespace-nowrap">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Activa
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0 px-1 py-0.5 whitespace-nowrap">
                        Elegir
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {line.tagline}
                  </p>

                  {/* Workshop Capabilities */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px]">
                    <span className="text-[9px] font-black tracking-wider uppercase text-slate-400">
                      Capacidades de Taller
                    </span>
                    {line.capabilities.map((cap, idx) => (
                      <div key={idx} className="leading-tight">
                        <span className="font-bold text-slate-700">{cap.label}: </span>
                        <span className="text-slate-500 text-[10px]">{cap.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Available Finishes */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                    <span className="text-[9px] font-black tracking-wider uppercase text-slate-400">
                      Acabados Disponibles
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {line.finishes.map((f, i) => (
                        <span
                          key={i}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold leading-none ${
                            isActive
                              ? 'bg-white border border-[#10B981]/30 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Button Footer */}
                <button
                  type="button"
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-[#10B981] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Configurando</span>
                    </>
                  ) : (
                    <span>Cotizar {line.title}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {viewMode === 'form' ? (
        /* ========================================================================= */
        /* PANTALLAS DE ENTRADA CON ESTILO EXACTO A LAS IMÁGENES 1, 2, 3 Y GRAN FORMATO */
        /* ========================================================================= */
        <div className="flex flex-col gap-5 animate-in fade-in duration-200">
          {/* Top Bar matching Images 1, 2, 3 */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] border border-[#10B981]/20 flex items-center justify-center text-[#10B981] shadow-2xs">
              {projectType === 'general' && <Layers className="w-6 h-6 stroke-[2.2]" />}
              {projectType === 'editorial' && <BookOpen className="w-6 h-6 stroke-[2.2]" />}
              {projectType === 'empaque' && <Package className="w-6 h-6 stroke-[2.2]" />}
              {projectType === 'gran_formato' && <Maximize2 className="w-6 h-6 stroke-[2.2]" />}
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-black text-[#262422] font-heading capitalize leading-tight">
                {projectType === 'gran_formato' ? 'Gran Formato' : projectType}
              </h2>
              <span className="text-xs text-slate-500 font-medium">Nueva cotización</span>
            </div>
          </div>

          {/* Card Container */}
          <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#E9E4D9] shadow-2xs flex flex-col gap-6">
            <span className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
              ESPECIFICACIONES DEL PROYECTO
            </span>

            {/* CLIENTE Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                CLIENTE
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.contact_name || c.business_name} {c.business_name ? `(${c.business_name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Row: NOMBRE DEL PROYECTO & CANTIDAD DE EJEMPLARES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  NOMBRE DEL PROYECTO
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder={
                    projectType === 'gran_formato'
                      ? 'Ej. Lona publicitaria Fachada Principal'
                      : projectType === 'empaque'
                      ? 'Ej. Caja cosmética con barniz UV'
                      : projectType === 'editorial'
                      ? 'Ej. Catálogo de productos Primavera 2026'
                      : 'Ej. Volantes 1/4 carta inauguración'
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  {projectType === 'gran_formato' ? 'CANTIDAD DE PIEZAS' : 'CANTIDAD DE EJEMPLARES'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity || ''}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="Ej. 1000"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-bold focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
                />
              </div>
            </div>

            {/* ======================================================= */}
            {/* OPCIÓN 1: GENERAL (Image 1)                             */}
            {/* ======================================================= */}
            {projectType === 'general' && (
              <>
                {/* MEDIDA DEL PRODUCTO */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      MEDIDA DEL PRODUCTO
                    </label>
                    {onOpenImposition && (
                      <button
                        type="button"
                        onClick={onOpenImposition}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F5132] hover:text-[#198754] transition-colors py-1 px-2.5 rounded-lg bg-[#EBF4EE] hover:bg-[#DCECE0]"
                      >
                        <LayoutGrid className="w-3.5 h-3.5 text-[#198754]" />
                        <span>Calculadora de imposición</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['Carta', 'Media carta', '1/4 carta', '1/8 carta', 'Personalizado'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setGeneralSize(sz)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          generalSize === sz
                            ? 'bg-[#10B981] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  {generalSize === 'Personalizado' && (
                    <div className="grid grid-cols-2 gap-3 mt-2 bg-white p-3.5 rounded-xl border border-slate-200">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">ANCHO (CM)</label>
                        <input
                          type="number"
                          value={generalCustomWidth}
                          onChange={(e) => setGeneralCustomWidth(Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">ALTO (CM)</label>
                        <input
                          type="number"
                          value={generalCustomHeight}
                          onChange={(e) => setGeneralCustomHeight(Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* PAPEL Section */}
                <div className="pt-4 border-t border-slate-200/60 flex flex-col gap-3">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    PAPEL Y SUSTRATO
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">TIPO DE PAPEL</label>
                      <select
                        value={generalPaperType}
                        onChange={(e) => setGeneralPaperType(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
                      >
                        <option value="Couché brillante">Couché brillante</option>
                        <option value="Couché mate">Couché mate</option>
                        <option value="Bond blanco">Bond blanco</option>
                        <option value="Opalina blanca">Opalina blanca</option>
                        <option value="Sulfatada 1 cara">Sulfatada 1 cara</option>
                        <option value="Bristol">Cartulina Bristol</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">GRAMAJE / CALIBRE</label>
                      <select
                        value={generalGrammage}
                        onChange={(e) => setGeneralGrammage(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
                      >
                        <option value="75g">75g</option>
                        <option value="90g">90g</option>
                        <option value="115g">115g</option>
                        <option value="130g">130g</option>
                        <option value="150g">150g</option>
                        <option value="200g">200g</option>
                        <option value="250g">250g</option>
                        <option value="300g">300g</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* TINTAS & PREPRENSA OFFSET (Estándar Printara México) */}
                <div className="pt-4 border-t border-slate-200/60 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      TINTAS & PREPRENSA OFFSET
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Guía Técnica Printara
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">CONFIGURACIÓN DE TINTAS</label>
                      <select
                        value={offsetInks}
                        onChange={(e) => setOffsetInks(e.target.value as any)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
                      >
                        <option value="4/0">4/0 — Frente selección de color (4 tintas)</option>
                        <option value="4/4">4/4 — Frente y vuelta a color (8 tintas)</option>
                        <option value="1/0">1/0 — Frente 1 tinta / Negro (1 tinta)</option>
                        <option value="1/1">1/1 — Frente y vuelta monocromático (2 tintas)</option>
                        <option value="4/1">4/1 — Frente color, vuelta monocromático (5 tintas)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">PLASTIFICADO / LAMINADO TÉRMICO</label>
                      <select
                        value={offsetLamination}
                        onChange={(e) => setOffsetLamination(e.target.value as any)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
                      >
                        <option value="none">Sin plastificado</option>
                        <option value="mate_1c">Plastificado térmico mate (1 cara)</option>
                        <option value="mate_2c">Plastificado térmico mate (2 caras)</option>
                        <option value="brillo_1c">Plastificado térmico brillante (1 cara)</option>
                        <option value="brillo_2c">Plastificado térmico brillante (2 caras)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">BARNIZ PROTECTOR</label>
                      <select
                        value={offsetVarnish}
                        onChange={(e) => setOffsetVarnish(e.target.value as any)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
                      >
                        <option value="none">Sin barniz adicional</option>
                        <option value="maquina">Barniz de sobreimpresión de máquina</option>
                        <option value="uv_registro">Barniz UV brillante a registro</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">PLEGADO / DOBLEZ</label>
                      <select
                        value={offsetFolding}
                        onChange={(e) => setOffsetFolding(e.target.value as any)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
                      >
                        <option value="none">Sin doblez (Corte recto a tamaño final)</option>
                        <option value="diptico">Doblado a Díptico (1 quiebre)</option>
                        <option value="triptico">Doblado a Tríptico (2 quiebres en acordeón / envolvente)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* TARJETA DINÁMICA DE MERMA Y RENDIMIENTO PRINTARA */}
                {offsetCalculations && (
                  <OffsetWasteCard
                    calc={offsetCalculations}
                    quantity={Number(quantity) || 1000}
                    offsetInks={offsetInks}
                  />
                )}
              </>
            )}

            {/* ======================================================= */}
            {/* OPCIÓN 2: EDITORIAL (Image 2)                           */}
            {/* ======================================================= */}
            {projectType === 'editorial' && (
              <>
                {/* MEDIDA DEL PRODUCTO */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    MEDIDA DEL PRODUCTO
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Carta', 'Media carta', '1/4 carta', '1/8 carta', 'Personalizado'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setEditorialSize(sz)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          editorialSize === sz
                            ? 'bg-[#10B981] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LOMO & SOLAPA (Image 2) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      LOMO
                    </label>
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#10B981]">
                      <input
                        type="number"
                        step="0.1"
                        value={editorialSpineCm}
                        onChange={(e) => setEditorialSpineCm(Number(e.target.value))}
                        className="w-full px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none"
                      />
                      <span className="px-3.5 py-3 text-xs font-bold text-slate-400 bg-slate-50 border-l border-slate-200">
                        cm
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      SOLAPA (CADA UNA)
                    </label>
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#10B981]">
                      <input
                        type="number"
                        step="0.5"
                        value={editorialFlapCm}
                        onChange={(e) => setEditorialFlapCm(Number(e.target.value))}
                        className="w-full px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none"
                      />
                      <span className="px-3.5 py-3 text-xs font-bold text-slate-400 bg-slate-50 border-l border-slate-200">
                        cm
                      </span>
                    </div>
                  </div>
                </div>

                {/* PAPEL Section */}
                <div className="pt-4 border-t border-slate-200/60 flex flex-col gap-3">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    PAPEL
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">TIPO DE PAPEL</label>
                      <select
                        value={editorialPaperType}
                        onChange={(e) => setEditorialPaperType(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
                      >
                        <option value="Couché mate">Couché mate</option>
                        <option value="Couché brillante">Couché brillante</option>
                        <option value="Bond ahuesado">Bond ahuesado 90g</option>
                        <option value="Sulfatada 12pts">Sulfatada 12pts</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">GRAMAJE / CALIBRE</label>
                      <select
                        value={editorialGrammage}
                        onChange={(e) => setEditorialGrammage(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
                      >
                        <option value="90g">90g</option>
                        <option value="115g">115g</option>
                        <option value="150g">150g</option>
                        <option value="200g">200g</option>
                        <option value="300g">300g</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ======================================================= */}
            {/* OPCIÓN 3: EMPAQUE (Image 3)                             */}
            {/* ======================================================= */}
            {projectType === 'empaque' && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    TIPO DE CAJA
                  </label>

                  {/* 3 Cards Grid matching Image 3 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Card 1: Pegado Lineal */}
                    <div
                      onClick={() => setBoxType('lineal')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[140px] ${
                        boxType === 'lineal'
                          ? 'border-[#10B981] bg-[#F4FDF7] shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="w-12 h-12 flex items-center justify-center text-slate-700">
                        {/* Box unfolding illustration */}
                        <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="8" y="12" width="32" height="24" rx="2" />
                          <path d="M8 20h32M16 12v24M32 12v24" strokeDasharray="2 2" />
                        </svg>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-slate-900">Pegado Lineal</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Solapa recta, se arma a mano
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Fondo Automático */}
                    <div
                      onClick={() => setBoxType('automatico')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[140px] ${
                        boxType === 'automatico'
                          ? 'border-[#10B981] bg-[#F4FDF7] shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="w-12 h-12 flex items-center justify-center text-slate-700">
                        {/* Crash lock box illustration */}
                        <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 10h24l-4 28H16L12 10z" />
                          <path d="M16 38l8-10 8 10" />
                        </svg>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-slate-900">Fondo Automático</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Se abre y el fondo se cierra solo
                        </span>
                      </div>
                    </div>

                    {/* Card 3: Semi Automático */}
                    <div
                      onClick={() => setBoxType('semi_automatico')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[140px] ${
                        boxType === 'semi_automatico'
                          ? 'border-[#10B981] bg-[#F4FDF7] shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="w-12 h-12 flex items-center justify-center text-slate-700">
                        {/* Semi-automatic snap bottom illustration */}
                        <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="10" y="10" width="28" height="28" rx="2" />
                          <path d="M10 24h28M24 10v28" />
                        </svg>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-slate-900">Semi Automático</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Fondo parcial, se cierra a mano
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box Dimensions & Substrate */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">LARGO / FRENTE (CM)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={boxLengthCm}
                      onChange={(e) => setBoxLengthCm(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">ANCHO / FONDO (CM)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={boxWidthCm}
                      onChange={(e) => setBoxWidthCm(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">ALTO / PROFUNDIDAD (CM)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={boxHeightCm}
                      onChange={(e) => setBoxHeightCm(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Sustrato y Formato de Pliego */}
                <div className="pt-4 border-t border-slate-200/60 flex flex-col gap-3">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    SUSTRATO DE EMPAQUE & PLIEGO
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">TIPO DE CARTULINA / CARTÓN</label>
                      <select
                        value={boxSubstrate}
                        onChange={(e) => setBoxSubstrate(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
                      >
                        <option value="Cartulina Sulfatada 16pts">Cartulina Sulfatada 16pts (Empaque Cosmético / Farmacia)</option>
                        <option value="Cartulina Sulfatada 14pts">Cartulina Sulfatada 14pts (Empaque Ligero / Retail)</option>
                        <option value="Cartulina Sulfatada 18pts">Cartulina Sulfatada 18pts (Estructural Pesado)</option>
                        <option value="Cartulina Sulfatada 20pts">Cartulina Sulfatada 20pts (Alta Resistencia)</option>
                        <option value="Cartulina Sulfatada 24pts">Cartulina Sulfatada 24pts (Rigidez Industrial)</option>
                        <option value="Caple Reverso Café 14pts">Cartulina Caple Reverso Café 14pts</option>
                        <option value="Caple Reverso Blanco 16pts">Cartulina Caple Reverso Blanco 16pts</option>
                        <option value="Microcorrugado Flauta E">Microcorrugado Flauta E Kraft</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">MEDIDA DE PLIEGO BASE</label>
                      <select
                        value={boxSheetSize}
                        onChange={(e) => setBoxSheetSize(e.target.value as any)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
                      >
                        <option value="70x95">70 × 95 cm (Estándar Sulfatada en México)</option>
                        <option value="61x86">61 × 86 cm (Formato Mediano)</option>
                        <option value="72x102">72 × 102 cm (Heidelberg CD102 Máximo)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tintas, Acabados y Troquel */}
                <div className="pt-4 border-t border-slate-200/60 flex flex-col gap-3">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    TINTAS, ACABADOS & SUAJADO
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">TINTAS DE IMPRESIÓN</label>
                      <select
                        value={boxInks}
                        onChange={(e) => setBoxInks(e.target.value as any)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
                      >
                        <option value="4/0">4/0 — Frente selección color CMYK exterior</option>
                        <option value="4/4">4/4 — Frente y vuelta a color (Interior impreso)</option>
                        <option value="1/0">1/0 — Frente monocromático / 1 tinta</option>
                        <option value="directas">Tintas directas Pantone / Especiales</option>
                        <option value="sin_impresion">Sin impresión (Troquelado y armado directo)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">ACABADO / RECUBRIMIENTO</label>
                      <select
                        value={boxFinish}
                        onChange={(e) => setBoxFinish(e.target.value as any)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
                      >
                        <option value="barniz_maquina">Barniz de sobreimpresión de máquina</option>
                        <option value="uv_registro">Barniz UV a registro de alto brillo</option>
                        <option value="plastificado_mate">Plastificado térmico BOPP mate (1 cara)</option>
                        <option value="plastificado_brillante">Plastificado térmico BOPP brillante (1 cara)</option>
                        <option value="none">Sin recubrimiento adicional</option>
                      </select>
                    </div>
                  </div>

                  {/* Estado del Suaje */}
                  <div className="flex flex-col gap-2 pt-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">ESTADO DEL SUAJE / TROQUEL</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBoxHasExistingDie(false)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          !boxHasExistingDie
                            ? 'bg-[#F4FDF7] border-[#10B981] shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Scissors className={`w-4 h-4 mt-0.5 shrink-0 ${!boxHasExistingDie ? 'text-[#10B981]' : 'text-slate-400'}`} />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">Fabricar suaje láser nuevo</span>
                          <span className="text-[10px] text-slate-500">
                            Cálculo proporcional de cuchillas y plecas de hendido
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBoxHasExistingDie(true)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          boxHasExistingDie
                            ? 'bg-[#F4FDF7] border-[#10B981] shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${boxHasExistingDie ? 'text-[#10B981]' : 'text-slate-400'}`} />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">Ya cuento con el suaje en almacén</span>
                          <span className="text-[10px] text-slate-500">
                            $0 fabricación · Sólo arreglo de platina y tiro de troquel
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* TARJETA DINÁMICA DE INGENIERÍA DE TROQUEL & IMPOSICIÓN PRINTARA */}
                {packagingCalculations && (
                  <PackagingEngineeringCard
                    calc={packagingCalculations}
                    quantity={Number(quantity) || 1000}
                  />
                )}
              </>
            )}

            {/* ======================================================= */}
            {/* OPCIÓN 4: GRAN FORMATO (Requisito 1 Personalizado)      */}
            {/* ======================================================= */}
            {projectType === 'gran_formato' && (
              <>
                {/* DIMENSIONES Y METROS CUADRADOS */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    DIMENSIONES Y METROS CUADRADOS
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">ANCHO (METROS)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={gfWidthM}
                        onChange={(e) => setGfWidthM(Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">ALTO (METROS)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={gfHeightM}
                        onChange={(e) => setGfHeightM(Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">ÁREA CALCULADA</label>
                      <div className="w-full p-2.5 bg-[#DCFCE7] text-[#10B981] border border-[#10B981]/20 rounded-xl text-xs font-black flex items-center justify-between">
                        <span>{(gfWidthM * gfHeightM).toFixed(2)} m² base</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          {((gfWidthM * gfHeightM) * quantity).toFixed(1)} m² tot
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUSTRATO / MATERIAL */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    TIPO DE SUSTRATO / MATERIAL
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Lona Frontlit 13oz',
                      'Lona Backlit Translúcida',
                      'Vinil Adhesivo Mate',
                      'Vinil Microperforado',
                      'Coroplast 4mm',
                      'Trovicel / PVC 3mm',
                      'Canvas Artístico',
                    ].map((mat) => (
                      <button
                        key={mat}
                        type="button"
                        onClick={() => setGfSubstrate(mat)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          gfSubstrate === mat
                            ? 'bg-[#10B981] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RESOLUCIÓN Y TINTA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">RESOLUCIÓN / CALIDAD</label>
                    <select
                      value={gfDpi}
                      onChange={(e) => setGfDpi(e.target.value as any)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
                    >
                      <option value="720">720 DPI — Gran Visibilidad Exterior</option>
                      <option value="1440">1440 DPI — Alta Definición Interiores</option>
                      <option value="2880">2880 DPI — Calidad Fotográfica Fina</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">TIPO DE TINTA</label>
                    <select
                      value={gfInkType}
                      onChange={(e) => setGfInkType(e.target.value as any)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
                    >
                      <option value="eco_solvente">Eco-Solvente (Resistente UV)</option>
                      <option value="uv">UV Curado Cama Plana</option>
                      <option value="latex">Látex Ecológica HP</option>
                      <option value="solvente">Solvente Pesada Exterior</option>
                    </select>
                  </div>
                </div>

                {/* MARGEN DE MERMA */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">MARGEN DE MERMA TÉCNICA</label>
                  <div className="flex items-center gap-3">
                    {[5, 8, 10, 15].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setGfWastePercent(pct)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          gfWastePercent === pct
                            ? 'bg-[#10B981] text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                    <span className="text-xs text-slate-400">Calibración recomendada para corte y montaje</span>
                  </div>
                </div>
              </>
            )}

            {/* CAMPOS OPCIONALES: MATERIAL Y OBSERVACIONES */}
            <div className="flex flex-col gap-3.5 pt-4 border-t border-slate-200/80">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Material (opcional)
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Material (opcional)"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Observaciones (opcional)
                </label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Observaciones (opcional)"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Bottom Actions Row matching Images 1, 2, 3 */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 mt-2">
              <button
                type="button"
                onClick={() => attemptNavigation(onCancel)}
                className="w-12 h-12 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 shadow-2xs transition-colors cursor-pointer"
                title="Regresar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={generateCalculatedItems}
                className="px-8 py-3.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>
                  {projectType === 'general' && 'Calcular papel →'}
                  {projectType === 'editorial' && 'Calcular portada →'}
                  {projectType === 'empaque' && 'Calcular empaque →'}
                  {projectType === 'gran_formato' && 'Calcular metros cuadrados & sustrato →'}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* PANTALLA DE REVISIÓN Y COSTEO FINANCIERO                                  */
        /* ========================================================================= */
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E9E4D9] shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#10B981] flex items-center justify-center font-bold">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#262422] font-heading">
                    Desglose Técnico y Costeo
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Línea: {projectType.toUpperCase()} · {quantity} unidades calculadas
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewMode('form')}
                className="text-xs font-bold text-[#10B981] hover:underline"
              >
                ← Modificar especificaciones
              </button>
            </div>

            {/* Partidas Table with full responsive overflow containment */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden mt-2">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[620px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="p-3.5 whitespace-nowrap">CONCEPTO / DESCRIPCIÓN TÉCNICA</th>
                      <th className="p-3.5 whitespace-nowrap text-center">CANT.</th>
                      <th className="p-3.5 whitespace-nowrap text-center">UNIDAD</th>
                      <th className="p-3.5 whitespace-nowrap text-right">PRECIO UNIT.</th>
                      <th className="p-3.5 whitespace-nowrap text-right">SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 max-w-[340px]">
                          <span className="font-bold text-slate-800 block break-words leading-tight">{it.description}</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5 break-words">{it.substrate_finishing}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700 text-center whitespace-nowrap">{it.quantity}</td>
                        <td className="p-3.5 text-slate-500 text-center whitespace-nowrap">{it.unit}</td>
                        <td className="p-3.5 font-mono text-right whitespace-nowrap">${it.unit_price.toFixed(2)}</td>
                        <td className="p-3.5 font-mono font-bold text-slate-900 text-right whitespace-nowrap">
                          ${it.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLA DE ESCALA DE PRECIOS Y MERMA PRINTARA (Offset General) */}
            {projectType === 'general' && (() => {
              const calc = offsetCalculations;
              if (!calc) return null;
              return (
                <div className="mt-2 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E9E4D9] flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-[#10B981]" />
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Economía de Escala por Volumen (Guía de Precios México - Printara)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      Comparativa de costos por millar según tiraje
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {calc.priceScale.map((sc) => {
                      const isCurrent = quantity === sc.qty;
                      const savings = Math.max(0, Math.round(((calc.priceScale[0].unitPrice - sc.unitPrice) / calc.priceScale[0].unitPrice) * 100));
                      return (
                        <div
                          key={sc.qty}
                          onClick={() => {
                            setQuantity(sc.qty);
                            generateCalculatedItems();
                          }}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                            isCurrent
                              ? 'bg-[#10B981]/15 border-[#10B981] shadow-2xs ring-1 ring-[#10B981]'
                              : 'bg-white border-slate-200 hover:border-[#10B981]/60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-slate-700">
                              {sc.qty.toLocaleString()} pzas
                            </span>
                            {savings > 0 && (
                              <span className="text-[9px] font-black text-[#059669] bg-[#DCFCE7] px-1.5 py-0.2 rounded-full">
                                -{savings}%
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col text-left mt-1">
                            <span className="text-[10px] text-slate-400">Precio Unitario:</span>
                            <span className="text-xs font-black text-slate-900 font-mono">
                              ${sc.unitPrice.toFixed(2)} MXN
                            </span>
                          </div>
                          <div className="flex flex-col text-left pt-1 border-t border-slate-100">
                            <span className="text-[9px] text-slate-400">Inversión Total:</span>
                            <span className="text-[11px] font-bold text-slate-700 font-mono">
                              ${sc.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      En impresión offset, los costos fijos (placas CTP y arreglo de prensa de ${calc.totalPlatesCost + calc.pressSetupCost} MXN) se amortizan drásticamente a partir de 2,000 y 5,000 unidades.
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Resumen de Campos Opcionales */}
            {(material.trim() || observations.trim()) && (
              <div className="p-3.5 bg-[#FAFBF9] border border-slate-200/80 rounded-2xl flex flex-col gap-2 text-xs">
                {material.trim() && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Material:</span>
                    <span className="font-semibold text-slate-800">{material.trim()}</span>
                  </div>
                )}
                {observations.trim() && (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Observaciones:</span>
                    <span className="text-slate-700 font-medium whitespace-pre-wrap">{observations.trim()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Totales y Descuento */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Descuento comercial:</span>
                <div className="flex items-center border border-slate-200 rounded-xl px-2.5 py-1 bg-white">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-12 text-xs font-bold text-center focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-right w-full sm:w-auto">
                <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-slate-500">
                  <span>Subtotal bruto:</span>
                  <span className="font-mono">${rawSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-rose-600 font-semibold">
                    <span>Descuento ({discountPercent}%):</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-slate-500">
                  <span>IVA (16%):</span>
                  <span className="font-mono">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 text-base font-black text-[#262422] pt-1 border-t border-slate-200">
                  <span>TOTAL MXN:</span>
                  <span className="font-mono text-lg text-[#10B981]">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Final Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => attemptNavigation(onCancel)}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveQuote(true)}
                  disabled={isSubmitting}
                  className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-slate-500" />
                  <span>Guardar Borrador</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveQuote(false)}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Guardando...' : 'Generar y Enviar Cotización'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
