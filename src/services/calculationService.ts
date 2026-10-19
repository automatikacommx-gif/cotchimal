import { OnboardingFullConfig, QuoteItem, WorkshopMachine } from '../types';

export interface GeneralCalculationParams {
  size: 'Carta' | 'Media carta' | '1/4 carta' | '1/8 carta' | 'Personalizado';
  customWidth?: number;
  customHeight?: number;
  paperType: string;
  grammage: string;
  quantity: number;
  offsetInks: '4/0' | '4/4' | '1/0' | '1/1' | '4/1';
  offsetLamination: 'none' | 'mate_1c' | 'mate_2c' | 'brillo_1c' | 'brillo_2c';
  offsetVarnish: 'none' | 'maquina' | 'uv_registro';
  offsetFolding: 'none' | 'diptico' | 'triptico';
}

export interface GeneralCalculationResult {
  piecesPerSheet: number;
  netSheets: number;
  setupWasteSheets: number;
  runWasteSheets: number;
  finishingWasteSheets: number;
  totalWasteSheets: number;
  grossSheets: number;
  wastePercent: number;
  pricePerSheet: number;
  totalPaperCost: number;
  plates: number;
  pricePerPlate: number;
  totalPlatesCost: number;
  pressSetupCost: number;
  thousandsRun: number;
  runCostPerThousand: number;
  totalPressCost: number;
  laminationCost: number;
  varnishCost: number;
  foldingCost: number;
  cuttingCost: number;
  directCost: number;
  suggestedTotal: number;
  priceScale: { qty: number; total: number; unitPrice: number }[];
  items: Omit<QuoteItem, 'id' | 'quote_id'>[];
}

export interface EditorialCalculationParams {
  size: 'Carta' | 'Media carta' | '1/4 carta' | '1/8 carta' | 'Personalizado';
  pages: number;
  spineCm: number;
  flapCm: number;
  coverPaperType: string;
  coverGrammage: string;
  insidePaperType?: string;
  insideGrammage?: string;
  quantity: number;
  coverLamination?: 'none' | 'mate' | 'brillo';
}

import {
  calculatePackagingQuote,
  calculateBoxFlatDimensions,
  calculatePackagingImposition,
  PackagingCalculationResult,
  PackagingParams,
  BoxFlatDimensions,
  PackagingImpositionResult,
} from './calculations/packagingEngine';

export interface EmpaqueCalculationParams extends PackagingParams {}

export {
  calculatePackagingQuote,
  calculateBoxFlatDimensions,
  calculatePackagingImposition,
  type PackagingCalculationResult,
  type PackagingParams,
  type BoxFlatDimensions,
  type PackagingImpositionResult,
};

export interface GranFormatoCalculationParams {
  substrate: string;
  widthM: number;
  heightM: number;
  quantity: number;
  dpi: '720' | '1440' | '2880';
  inkType: 'eco_solvente' | 'solvente' | 'uv' | 'latex';
  finishes: string[];
  wastePercent: number;
}

/**
 * Encuentra el precio del papel en el catálogo dinámico de la imprenta
 */
export function getDynamicPaperPrice(
  paperName: string,
  grammageLabel: string,
  config: OnboardingFullConfig | null
): number {
  const cleanGrammage = parseInt(grammageLabel.replace(/\D/g, ''), 10);

  if (config?.papers && config.papers.length > 0) {
    const matchedPaper = config.papers.find(
      (p) =>
        p.name.toLowerCase().includes(paperName.toLowerCase()) ||
        paperName.toLowerCase().includes(p.name.toLowerCase())
    );

    if (matchedPaper && matchedPaper.grammages && matchedPaper.grammages.length > 0) {
      const matchedGrammage = matchedPaper.grammages.find((g) => {
        const gWeight = typeof g.grammage === 'number' ? g.grammage : parseInt(String(g.grammage).replace(/\D/g, ''), 10);
        return gWeight === cleanGrammage;
      });

      if (matchedGrammage && matchedGrammage.price_per_thousand > 0) {
        return Number((matchedGrammage.price_per_thousand / 1000).toFixed(2));
      }
    }
  }

  // Precios estándar de referencia del mercado gráfico en México (pesos MXN por pliego)
  const defaultFallbackPrices: Record<string, number> = {
    '75': 1.35,
    '90': 1.65,
    '115': 2.30,
    '130': 2.85,
    '150': 3.30,
    '200': 4.40,
    '250': 5.50,
    '300': 6.80,
  };

  return defaultFallbackPrices[String(cleanGrammage)] || 2.85;
}

/**
 * Busca la máquina offset o digital activa en la configuración del taller
 */
export function getActiveOffsetMachine(config: OnboardingFullConfig | null): WorkshopMachine | null {
  if (!config?.machines || config.machines.length === 0) return null;
  return (
    config.machines.find((m) => m.is_active && m.machine_type === 'offset') ||
    config.machines.find((m) => m.is_active) ||
    config.machines[0]
  );
}

export const calculationService = {
  /**
   * Cálculo Línea 1: Impresión General Offset / Digital Comercial
   */
  calculateGeneral(
    params: GeneralCalculationParams,
    config: OnboardingFullConfig | null
  ): GeneralCalculationResult {
    const {
      size,
      customWidth = 21.5,
      customHeight = 28,
      paperType,
      grammage,
      quantity = 1000,
      offsetInks,
      offsetLamination,
      offsetVarnish,
      offsetFolding,
    } = params;

    // 1. Imposición y piezas por pliego
    let piecesPerSheet = 8;
    if (size === 'Carta') piecesPerSheet = 8;
    else if (size === 'Media carta') piecesPerSheet = 16;
    else if (size === '1/4 carta') piecesPerSheet = 32;
    else if (size === '1/8 carta') piecesPerSheet = 64;
    else if (size === 'Personalizado') {
      const w = Math.max(1, customWidth);
      const h = Math.max(1, customHeight);
      const fit1 = Math.floor(70 / w) * Math.floor(95 / h);
      const fit2 = Math.floor(70 / h) * Math.floor(95 / w);
      piecesPerSheet = Math.max(1, Math.max(fit1, fit2));
    }

    const netSheets = Math.ceil(quantity / piecesPerSheet);

    // 2. Máquina y escalas de merma dinámicas desde Supabase
    const activeMachine = getActiveOffsetMachine(config);
    let baseSetupWaste = 60;

    if (activeMachine?.waste_scales && activeMachine.waste_scales.length > 0) {
      const matchedScale = activeMachine.waste_scales.find(
        (ws) => netSheets >= ws.from_sheets && (ws.to_sheets === null || netSheets <= ws.to_sheets)
      );
      if (matchedScale) {
        baseSetupWaste = matchedScale.waste_sheets;
      }
    }

    // Ajuste de merma de puesta a punto según cantidad de colores y torres
    let setupWasteMultiplier = 1.0;
    if (offsetInks === '4/4') setupWasteMultiplier = 1.6;
    else if (offsetInks === '1/0') setupWasteMultiplier = 0.5;
    else if (offsetInks === '1/1') setupWasteMultiplier = 0.8;
    else if (offsetInks === '4/1') setupWasteMultiplier = 1.3;

    const setupWasteSheets = Math.round(baseSetupWaste * setupWasteMultiplier);

    // 3. Merma de tiro / rodaje (3% del tiraje neto, mín 20)
    const runWasteSheets = Math.max(20, Math.ceil(netSheets * 0.03));

    // 4. Merma de acabados post-prensa según guía Printara (2.5% laminado, 1.5% doblez, 2% UV)
    let finishingWastePct = 0;
    if (offsetLamination !== 'none') finishingWastePct += 0.025;
    if (offsetFolding !== 'none') finishingWastePct += 0.015;
    if (offsetVarnish === 'uv_registro') finishingWastePct += 0.02;
    const finishingWasteSheets = Math.ceil(netSheets * finishingWastePct);

    // Pliegos brutos y porcentaje de merma total
    const totalWasteSheets = setupWasteSheets + runWasteSheets + finishingWasteSheets;
    const grossSheets = netSheets + totalWasteSheets;
    const wastePercent = netSheets > 0 ? Number(((totalWasteSheets / netSheets) * 100).toFixed(1)) : 0;

    // 5. Costo de papel dinámico
    const pricePerSheet = getDynamicPaperPrice(paperType, grammage, config);
    const totalPaperCost = Number((grossSheets * pricePerSheet).toFixed(2));

    // 6. Placas CTP
    const plateCounts: Record<string, number> = {
      '4/0': 4,
      '4/4': 8,
      '1/0': 1,
      '1/1': 2,
      '4/1': 5,
    };
    const plates = plateCounts[offsetInks] || 4;
    const pricePerPlate = activeMachine?.plate_price ? Number(activeMachine.plate_price) : 140.0;
    const totalPlatesCost = plates * pricePerPlate;

    // 7. Puesta a punto y tiro de rodaje de prensa
    const passes = offsetInks === '4/4' || offsetInks === '1/1' || offsetInks === '4/1' ? 2 : 1;
    const totalImpressions = grossSheets * passes;
    const thousandsRun = Math.max(1, Math.ceil(totalImpressions / 1000));

    // Tarifa por millar de impresión desde máquina
    let runCostPerThousand = 380.0;
    if (activeMachine) {
      if (activeMachine.pricing_mode === 'scale' && activeMachine.price_scales?.length) {
        const matchedScale = activeMachine.price_scales.find(
          (s) => thousandsRun >= s.from_thousands && (s.to_thousands === null || thousandsRun <= s.to_thousands)
        );
        if (matchedScale) {
          runCostPerThousand = matchedScale.price_per_unit;
        }
      } else if (activeMachine.print_price) {
        runCostPerThousand = Number(activeMachine.print_price);
      }
    }

    const pressSetupCost = activeMachine?.print_price_fixed ? Number(activeMachine.print_price_fixed) : 450.0;
    const totalPressCost = pressSetupCost + thousandsRun * runCostPerThousand;

    // 8. Costos de Acabados desde workshop_services
    let laminationCost = 0;
    const lamService = config?.services?.find((s) => s.category === 'recubrimientos' && s.name.toLowerCase().includes('plastific'));
    const lamUnitRate = lamService?.price ? Number(lamService.price) : 1.60;

    if (offsetLamination === 'mate_1c' || offsetLamination === 'brillo_1c') {
      laminationCost = Number((grossSheets * lamUnitRate).toFixed(2));
    } else if (offsetLamination === 'mate_2c' || offsetLamination === 'brillo_2c') {
      laminationCost = Number((grossSheets * (lamUnitRate * 1.875)).toFixed(2));
    }

    let varnishCost = 0;
    if (offsetVarnish === 'maquina') {
      varnishCost = Number((grossSheets * 0.40).toFixed(2));
    } else if (offsetVarnish === 'uv_registro') {
      const uvService = config?.services?.find((s) => s.category === 'recubrimientos' && s.name.toLowerCase().includes('uv'));
      const uvRate = uvService?.price ? Number(uvService.price) : 2.50;
      varnishCost = Number((grossSheets * uvRate).toFixed(2));
    }

    let foldingCost = 0;
    const foldService = config?.services?.find((s) => s.category === 'acabados' && s.name.toLowerCase().includes('doble'));
    const foldRate = foldService?.price ? Number(foldService.price) : 0.20;

    if (offsetFolding === 'diptico') {
      foldingCost = Number((quantity * foldRate).toFixed(2));
    } else if (offsetFolding === 'triptico') {
      foldingCost = Number((quantity * (foldRate * 1.75)).toFixed(2));
    }

    // Corte final en guillotina
    const cutService = config?.services?.find((s) => s.category === 'acabados' && s.name.toLowerCase().includes('corte'));
    const cuttingCost = cutService?.price ? Number(cutService.price) : (config?.company?.final_cut_price ? Number(config.company.final_cut_price) * 260 : 260.0);

    const directCost = totalPaperCost + totalPlatesCost + totalPressCost + laminationCost + varnishCost + foldingCost + cuttingCost;
    const suggestedTotal = Number((directCost * 1.38).toFixed(2));

    // Escala comparativa de tirajes
    const computeQtyTotal = (qty: number) => {
      const nSheets = Math.ceil(qty / piecesPerSheet);
      const rWaste = Math.max(20, Math.ceil(nSheets * 0.03));
      const fWaste = Math.ceil(nSheets * finishingWastePct);
      const gSheets = nSheets + setupWasteSheets + rWaste + fWaste;
      const pCost = gSheets * pricePerSheet;
      const thRun = Math.max(1, Math.ceil((gSheets * passes) / 1000));
      const prCost = pressSetupCost + thRun * runCostPerThousand;
      let lam = 0;
      if (offsetLamination === 'mate_1c' || offsetLamination === 'brillo_1c') lam = gSheets * lamUnitRate;
      else if (offsetLamination === 'mate_2c' || offsetLamination === 'brillo_2c') lam = gSheets * (lamUnitRate * 1.875);
      let varn = 0;
      if (offsetVarnish === 'maquina') varn = gSheets * 0.40;
      else if (offsetVarnish === 'uv_registro') varn = gSheets * 2.50;
      let fold = 0;
      if (offsetFolding === 'diptico') fold = qty * foldRate;
      else if (offsetFolding === 'triptico') fold = qty * (foldRate * 1.75);
      const dCost = pCost + totalPlatesCost + prCost + lam + varn + fold + cuttingCost;
      return Number((dCost * 1.38).toFixed(2));
    };

    const priceScale = [
      { qty: 1000, total: computeQtyTotal(1000), unitPrice: computeQtyTotal(1000) / 1000 },
      { qty: 2000, total: computeQtyTotal(2000), unitPrice: computeQtyTotal(2000) / 2000 },
      { qty: 5000, total: computeQtyTotal(5000), unitPrice: computeQtyTotal(5000) / 5000 },
      { qty: 10000, total: computeQtyTotal(10000), unitPrice: computeQtyTotal(10000) / 10000 },
    ];

    // Construcción de partidas
    const items: Omit<QuoteItem, 'id' | 'quote_id'>[] = [
      {
        description: `Papel ${paperType} ${grammage} en pliego extendido (${netSheets} pliegos netos + ${totalWasteSheets} merma = ${grossSheets} pliegos brutos)`,
        quantity: grossSheets,
        unit: 'Pliego',
        unit_price: pricePerSheet,
        substrate_finishing: `${paperType} ${grammage} (Merma calibrada: ${wastePercent}%)`,
        subtotal: totalPaperCost,
      },
      {
        description: `Preprensa y elaboración de placas térmicas CTP (${plates} placas para tintas ${offsetInks})`,
        quantity: plates,
        unit: 'Placa CTP',
        unit_price: pricePerPlate,
        substrate_finishing: `Tintas ${offsetInks} · Calibración de curvas y ganancia de punto`,
        subtotal: totalPlatesCost,
      },
      {
        description: `Puesta a punto de prensa offset y tiro de rodaje (${thousandsRun} millar${thousandsRun > 1 ? 'es' : ''} de tiro)`,
        quantity: thousandsRun,
        unit: 'Millar',
        unit_price: Number((totalPressCost / thousandsRun).toFixed(2)),
        substrate_finishing: `Prensa 4 torres · Arreglo de registro y entintado`,
        subtotal: totalPressCost,
      },
    ];

    if (laminationCost > 0) {
      const lamLabel = offsetLamination.includes('mate') ? 'Plastificado térmico mate' : 'Plastificado térmico brillante';
      const faces = offsetLamination.includes('2c') ? '2 caras' : '1 cara';
      items.push({
        description: `${lamLabel} a ${faces}`,
        quantity: grossSheets,
        unit: 'Pliego',
        unit_price: Number((laminationCost / grossSheets).toFixed(2)),
        substrate_finishing: `Película BOPP térmica ${faces}`,
        subtotal: laminationCost,
      });
    }

    if (varnishCost > 0) {
      const varnLabel = offsetVarnish === 'maquina' ? 'Barniz de sobreimpresión de máquina' : 'Barniz UV brillante a registro';
      items.push({
        description: varnLabel,
        quantity: grossSheets,
        unit: 'Pliego',
        unit_price: Number((varnishCost / grossSheets).toFixed(2)),
        substrate_finishing: 'Protección contra roce y secado acelerado',
        subtotal: varnishCost,
      });
    }

    if (foldingCost > 0) {
      const foldLabel = offsetFolding === 'diptico' ? 'Doblado a díptico (1 quiebre)' : 'Doblado a tríptico (2 quiebres)';
      items.push({
        description: `Plegado mecanizado: ${foldLabel}`,
        quantity,
        unit: 'Pza',
        unit_price: Number((foldingCost / quantity).toFixed(2)),
        substrate_finishing: 'Plegadora automática de bolsas con pre-marcado',
        subtotal: foldingCost,
      });
    }

    items.push({
      description: 'Refine en guillotina computarizada a registro y empaque flejado / termoencogible',
      quantity: 1,
      unit: 'Lote',
      unit_price: cuttingCost,
      substrate_finishing: 'Corte de escuadra y protección para despacho',
      subtotal: cuttingCost,
    });

    return {
      piecesPerSheet,
      netSheets,
      setupWasteSheets,
      runWasteSheets,
      finishingWasteSheets,
      totalWasteSheets,
      grossSheets,
      wastePercent,
      pricePerSheet,
      totalPaperCost,
      plates,
      pricePerPlate,
      totalPlatesCost,
      pressSetupCost,
      thousandsRun,
      runCostPerThousand,
      totalPressCost,
      laminationCost,
      varnishCost,
      foldingCost,
      cuttingCost,
      directCost,
      suggestedTotal,
      priceScale,
      items,
    };
  },

  /**
   * Cálculo Línea 2: Editorial (Libros, Revistas, Catálogos)
   */
  calculateEditorial(
    params: EditorialCalculationParams,
    config: OnboardingFullConfig | null
  ): Omit<QuoteItem, 'id' | 'quote_id'>[] {
    const {
      size,
      pages,
      spineCm,
      flapCm,
      coverPaperType,
      coverGrammage,
      quantity,
    } = params;

    const coverPaperPrice = getDynamicPaperPrice(coverPaperType, coverGrammage, config);
    const insidePaperPrice = getDynamicPaperPrice('Bond', '90g', config);

    // Encuadernación hotmelt desde servicios
    const hotmeltService = config?.services?.find((s) => s.category === 'acabados' && s.name.toLowerCase().includes('hotmelt'));
    const hotmeltRate = hotmeltService?.price ? Number(hotmeltService.price) : 6.50;

    // Costo portada: papel + laminado mate + placas + impresión
    const baseCoverPrice = Number((coverPaperPrice * 2 + 5.5 + (hotmeltRate * 0.4)).toFixed(2));
    // Costo interiores: pliegos por libro (16 págs/pliego) * precio papel * impresión
    const signatures = Math.ceil(pages / 16);
    const baseInsidePrice = Number((signatures * insidePaperPrice * 4.2 + (hotmeltRate * 0.6)).toFixed(2));

    return [
      {
        description: `Portadas a color con lomo ${spineCm}cm y solapas ${flapCm}cm en ${coverPaperType} ${coverGrammage}`,
        quantity,
        unit: 'Ejemplar',
        unit_price: baseCoverPrice,
        substrate_finishing: `${coverPaperType} ${coverGrammage} + Plastificado mate y plecas de lomo`,
        subtotal: Number((quantity * baseCoverPrice).toFixed(2)),
      },
      {
        description: `Interiores ${pages} páginas (${signatures} cuadernillo${signatures > 1 ? 's' : ''}) en Bond 90g encuadernación Hotmelt`,
        quantity,
        unit: 'Ejemplar',
        unit_price: baseInsidePrice,
        substrate_finishing: `Bond 90g + Pegado térmico lateral y cabezada`,
        subtotal: Number((quantity * baseInsidePrice).toFixed(2)),
      },
    ];
  },

  /**
   * Cálculo Línea 3: Empaque y Cajas Plegadizas (Ingeniería de Troquel, Imposición y Mermas Printara)
   */
  calculateEmpaque(
    params: EmpaqueCalculationParams,
    config: OnboardingFullConfig | null
  ): Omit<QuoteItem, 'id' | 'quote_id'>[] {
    const result = calculatePackagingQuote(params, config);
    return result.items;
  },

  /**
   * Cálculo Línea 3 Detallado: Devuelve métricas de desarrollo plano, suaje e imposición
   */
  calculateEmpaqueDetailed(
    params: EmpaqueCalculationParams,
    config: OnboardingFullConfig | null
  ): PackagingCalculationResult {
    return calculatePackagingQuote(params, config);
  },

  /**
   * Cálculo Línea 4: Gran Formato
   */
  calculateGranFormato(
    params: GranFormatoCalculationParams,
    config: OnboardingFullConfig | null
  ): Omit<QuoteItem, 'id' | 'quote_id'>[] {
    const { substrate, widthM, heightM, quantity, dpi, inkType, finishes, wastePercent } = params;

    const baseArea = Number((widthM * heightM).toFixed(2));
    const totalArea = Number((baseArea * quantity).toFixed(2));

    // Precio por m² según tipo de substrato
    let costPerM2 = 180;
    if (substrate.includes('Canvas')) costPerM2 = 450;
    else if (substrate.includes('Backlit')) costPerM2 = 280;
    else if (substrate.includes('Vinil')) costPerM2 = 220;

    // Factor por tipo de tinta
    if (inkType === 'uv') costPerM2 = Math.round(costPerM2 * 1.25);
    else if (inkType === 'latex') costPerM2 = Math.round(costPerM2 * 1.15);

    const subtotalM2 = Number((totalArea * costPerM2).toFixed(2));

    // Acabados de confección (ojillos + dobladillo perimetral)
    const perimeterMeters = Number(((widthM + heightM) * 2).toFixed(2));
    const finishUnitPrice = Math.max(35, Math.round(perimeterMeters * 12));
    const finishSubtotal = Number((quantity * finishUnitPrice).toFixed(2));

    return [
      {
        description: `Impresión Gran Formato ${substrate} (${widthM}m × ${heightM}m = ${baseArea} m² por pieza) a ${dpi} DPI`,
        quantity: totalArea,
        unit: 'm²',
        unit_price: costPerM2,
        substrate_finishing: `${substrate} · Tinta ${inkType}`,
        subtotal: subtotalM2,
      },
      {
        description: `Acabados exteriores y confección: ${finishes.join(', ')} (Merma calibrada: ${wastePercent}%)`,
        quantity,
        unit: 'Pza',
        unit_price: finishUnitPrice,
        substrate_finishing: 'Termosellado perimetral & ojillos reforzados',
        subtotal: finishSubtotal,
      },
    ];
  },
};
