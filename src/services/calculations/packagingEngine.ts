import { OnboardingFullConfig, QuoteItem } from '../../types';
import { getDynamicPaperPrice, getActiveOffsetMachine } from '../calculationService';

export type PackagingBoxType = 'lineal' | 'automatico' | 'semi_automatico';

export interface PackagingParams {
  boxType: PackagingBoxType;
  lengthCm: number;   // L = Largo / Frente
  widthCm: number;    // W = Ancho / Fondo
  heightCm: number;   // H = Alto / Profundidad
  substrate: string;  // ej. Cartulina Sulfatada 16pts, Caple 14pts, etc.
  quantity: number;
  fluteOrCaliber?: string;
  inks?: '4/0' | '4/4' | '1/0' | 'directas' | 'sin_impresion';
  finish?: 'none' | 'barniz_maquina' | 'uv_registro' | 'plastificado_mate' | 'plastificado_brillante';
  hasExistingDie?: boolean; // ¿Ya cuenta con el troquel/suaje?
  sheetSize?: '70x95' | '61x86' | '72x102';
}

export interface BoxFlatDimensions {
  flatWidthCm: number;
  flatHeightCm: number;
  glueFlapCm: number;
  topFlapCm: number;
  bottomFlapCm: number;
  perimeterCutMeters: number;
  creasingMeters: number;
  totalRuleMeters: number;
}

export interface PackagingImpositionResult {
  sheetWidthCm: number;
  sheetHeightCm: number;
  gripperCm: number;
  usableWidthCm: number;
  usableHeightCm: number;
  boxFlatWidthWithGutter: number;
  boxFlatHeightWithGutter: number;
  colsNormal: number;
  rowsNormal: number;
  totalNormal: number;
  colsRotated: number;
  rowsRotated: number;
  totalRotated: number;
  piecesPerSheet: number;
  isRotated: boolean;
  sheetUtilizationPercent: number;
}

export interface PackagingWasteBreakdown {
  pressSetupSheets: number;
  pressRunSheets: number;
  coatingWasteSheets: number;
  dieSetupSheets: number;
  dieRunSheets: number;
  gluingWasteSheets: number;
  totalWasteSheets: number;
  wastePercent: number;
}

export interface PackagingCalculationResult {
  boxFlat: BoxFlatDimensions;
  imposition: PackagingImpositionResult;
  netSheets: number;
  waste: PackagingWasteBreakdown;
  grossSheets: number;
  // Costos detallados
  substratePricePerSheet: number;
  totalSubstrateCost: number;
  platesCount: number;
  platesCost: number;
  pressSetupCost: number;
  pressRunCost: number;
  totalPressCost: number;
  coatingCost: number;
  dieManufacturingCost: number;
  dieSetupCost: number;
  dieRunCost: number;
  totalDieCost: number;
  gluingSetupCost: number;
  gluingRunCost: number;
  totalGluingCost: number;
  directCost: number;
  suggestedTotal: number;
  unitPrice: number;
  priceScale: { qty: number; total: number; unitPrice: number }[];
  items: Omit<QuoteItem, 'id' | 'quote_id'>[];
}

/**
 * 1. Calcula el plano mecánico extendido (desarrollo del troquel) según la estructura de la caja
 */
export function calculateBoxFlatDimensions(
  boxType: PackagingBoxType,
  lengthCm: number,
  widthCm: number,
  heightCm: number
): BoxFlatDimensions {
  const L = Math.max(1, lengthCm);
  const W = Math.max(1, widthCm);
  const H = Math.max(1, heightCm);

  let glueFlapCm = 1.6;
  let topFlapCm = Number((W + 1.5).toFixed(1));
  let bottomFlapCm = Number((W + 1.5).toFixed(1));
  let creasingInternalCm = 0;

  if (boxType === 'lineal') {
    glueFlapCm = 1.6;
    topFlapCm = Number((W + 1.5).toFixed(1));
    bottomFlapCm = Number((W + 1.5).toFixed(1));
    // 4 pliegues de paneles verticales + 2 horizontales principales + pestañas
    creasingInternalCm = 4 * H + 2 * (2 * L + 2 * W) + H + 2 * L;
  } else if (boxType === 'automatico') {
    // Fondo automático (crash lock): requiere solapas inferiores interconectadas en diagonal
    glueFlapCm = 1.8;
    topFlapCm = Number((W + 1.5).toFixed(1));
    bottomFlapCm = Number((W * 0.75 + 1.8).toFixed(1));
    // Pliegues de cuerpo + diagonales a 45 grados de fondo automático
    const diagonalCreasing = 2 * (W * 1.414);
    creasingInternalCm = 4 * H + 2 * (2 * L + 2 * W) + H + diagonalCreasing;
  } else if (boxType === 'semi_automatico') {
    // Fondo semiautomático (1-2-3 snap bottom)
    glueFlapCm = 1.6;
    topFlapCm = Number((W + 1.5).toFixed(1));
    bottomFlapCm = Number((W * 0.65 + 1.5).toFixed(1));
    creasingInternalCm = 4 * H + 2 * (2 * L + 2 * W) + H + 2 * (W * 0.65);
  }

  const flatWidthCm = Number(((2 * L) + (2 * W) + glueFlapCm).toFixed(1));
  const flatHeightCm = Number((H + topFlapCm + bottomFlapCm).toFixed(1));

  // Perímetro exterior de cuchillas de corte
  const perimeterCutCm = Number(((flatWidthCm + flatHeightCm) * 2 * 1.05).toFixed(1));
  const creasingCm = Number(creasingInternalCm.toFixed(1));

  const perimeterCutMeters = Number((perimeterCutCm / 100).toFixed(2));
  const creasingMeters = Number((creasingCm / 100).toFixed(2));
  const totalRuleMeters = Number((perimeterCutMeters + creasingMeters).toFixed(2));

  return {
    flatWidthCm,
    flatHeightCm,
    glueFlapCm,
    topFlapCm,
    bottomFlapCm,
    perimeterCutMeters,
    creasingMeters,
    totalRuleMeters,
  };
}

/**
 * 2. Imposición de las cajas extendidas en el pliego de cartulina
 */
export function calculatePackagingImposition(
  flatWidthCm: number,
  flatHeightCm: number,
  sheetSize: '70x95' | '61x86' | '72x102' = '70x95'
): PackagingImpositionResult {
  let sheetWidthCm = 70;
  let sheetHeightCm = 95;

  if (sheetSize === '61x86') {
    sheetWidthCm = 61;
    sheetHeightCm = 86;
  } else if (sheetSize === '72x102') {
    sheetWidthCm = 72;
    sheetHeightCm = 102;
  }

  // Márgenes técnicos de taller
  const gripperCm = 1.2; // Pinza de troqueladora y prensa offset
  const counterGripperCm = 0.5;
  const sideMarginCm = 0.5;
  const gutterCm = 0.5; // Calle de corte/separación entre poses de suaje

  const usableWidthCm = Math.max(1, sheetWidthCm - (sideMarginCm * 2));
  const usableHeightCm = Math.max(1, sheetHeightCm - (gripperCm + counterGripperCm));

  const boxFlatWidthWithGutter = flatWidthCm + gutterCm;
  const boxFlatHeightWithGutter = flatHeightCm + gutterCm;

  // Opción 1: Normal
  const colsNormal = Math.max(0, Math.floor(usableWidthCm / boxFlatWidthWithGutter));
  const rowsNormal = Math.max(0, Math.floor(usableHeightCm / boxFlatHeightWithGutter));
  const totalNormal = colsNormal * rowsNormal;

  // Opción 2: Girada 90 grados
  const colsRotated = Math.max(0, Math.floor(usableWidthCm / boxFlatHeightWithGutter));
  const rowsRotated = Math.max(0, Math.floor(usableHeightCm / boxFlatWidthWithGutter));
  const totalRotated = colsRotated * rowsRotated;

  const isRotated = totalRotated > totalNormal;
  const piecesPerSheet = Math.max(1, isRotated ? totalRotated : totalNormal);

  // Aprovechamiento de superficie
  const singleBoxArea = flatWidthCm * flatHeightCm;
  const totalSheetArea = sheetWidthCm * sheetHeightCm;
  const sheetUtilizationPercent = Number(
    Math.min(100, ((singleBoxArea * piecesPerSheet) / totalSheetArea) * 100).toFixed(1)
  );

  return {
    sheetWidthCm,
    sheetHeightCm,
    gripperCm,
    usableWidthCm,
    usableHeightCm,
    boxFlatWidthWithGutter,
    boxFlatHeightWithGutter,
    colsNormal,
    rowsNormal,
    totalNormal,
    colsRotated,
    rowsRotated,
    totalRotated,
    piecesPerSheet,
    isRotated,
    sheetUtilizationPercent,
  };
}

/**
 * 3. Motor Completo de Cotización y Análisis de Empaque (Packaging)
 */
export function calculatePackagingQuote(
  params: PackagingParams,
  config: OnboardingFullConfig | null
): PackagingCalculationResult {
  const {
    boxType,
    lengthCm,
    widthCm,
    heightCm,
    substrate,
    quantity,
    inks = '4/0',
    finish = 'barniz_maquina',
    hasExistingDie = false,
    sheetSize = '70x95',
  } = params;

  // 1. Dimensiones planas y desarrollo
  const boxFlat = calculateBoxFlatDimensions(boxType, lengthCm, widthCm, heightCm);

  // 2. Imposición de pliego
  const imposition = calculatePackagingImposition(boxFlat.flatWidthCm, boxFlat.flatHeightCm, sheetSize);

  // 3. Pliegos netos necesarios
  const netSheets = Math.ceil(quantity / imposition.piecesPerSheet);

  // 4. Mermas de Producción Escalonadas (Estándar Printara México)
  // Prensa: Puesta a punto según tintas
  const activeMachine = getActiveOffsetMachine(config);
  let baseSetupSheets = 70;
  if (activeMachine?.waste_scales && activeMachine.waste_scales.length > 0) {
    const matchedScale = activeMachine.waste_scales.find(
      (ws) => netSheets >= ws.from_sheets && (ws.to_sheets === null || netSheets <= ws.to_sheets)
    );
    if (matchedScale) baseSetupSheets = matchedScale.waste_sheets || 70;
  }

  let inkFactor = 1.0;
  if (inks === '4/4') inkFactor = 1.6;
  else if (inks === '1/0') inkFactor = 0.5;
  else if (inks === 'directas') inkFactor = 1.25;
  else if (inks === 'sin_impresion') inkFactor = 0;

  const pressSetupSheets = Math.round(baseSetupSheets * inkFactor);
  const pressRunSheets = Math.max(25, Math.ceil(netSheets * 0.03)); // 3% rodaje

  // Merma de recubrimiento
  let coatingWasteSheets = 0;
  if (finish !== 'none') {
    coatingWasteSheets = Math.max(15, Math.ceil(netSheets * 0.025)); // 2.5%
  }

  // Merma de troquelado (arreglo de platina + tiro de suaje)
  const dieSetupSheets = 35; // Hojas de ajuste de troquel
  const dieRunSheets = Math.max(15, Math.ceil(netSheets * 0.015)); // 1.5%

  // Merma de pegadora (cajas calibradas en alimentador y boquillas)
  const gluingWasteSheets = Math.ceil(netSheets * 0.015);

  const totalWasteSheets =
    pressSetupSheets +
    pressRunSheets +
    coatingWasteSheets +
    dieSetupSheets +
    dieRunSheets +
    gluingWasteSheets;

  const grossSheets = netSheets + totalWasteSheets;
  const wastePercent = netSheets > 0 ? Number(((totalWasteSheets / netSheets) * 100).toFixed(1)) : 0;

  const waste: PackagingWasteBreakdown = {
    pressSetupSheets,
    pressRunSheets,
    coatingWasteSheets,
    dieSetupSheets,
    dieRunSheets,
    gluingWasteSheets,
    totalWasteSheets,
    wastePercent,
  };

  // 5. Costo de Sustrato (Sulfatada / Caple)
  // Resolver precio por pliego extendido
  const substratePricePerSheet = getDynamicPaperPrice(substrate, '250g', config);
  const totalSubstrateCost = Number((grossSheets * substratePricePerSheet).toFixed(2));

  // 6. Preprensa y Placas CTP
  const plateMap: Record<string, number> = {
    '4/0': 4,
    '4/4': 8,
    '1/0': 1,
    'directas': 2,
    'sin_impresion': 0,
  };
  const platesCount = plateMap[inks] ?? 4;
  const pricePerPlate = activeMachine?.plate_price ? Number(activeMachine.plate_price) : 140.0;
  const platesCost = platesCount * pricePerPlate;

  // 7. Impresión Offset
  const passes = inks === '4/4' ? 2 : (inks === 'sin_impresion' ? 0 : 1);
  const totalImpressions = grossSheets * passes;
  const thousandsRun = passes > 0 ? Math.max(1, Math.ceil(totalImpressions / 1000)) : 0;

  let runCostPerThousand = 380.0;
  if (activeMachine) {
    if (activeMachine.pricing_mode === 'scale' && activeMachine.price_scales?.length) {
      const matchedScale = activeMachine.price_scales.find(
        (s) => thousandsRun >= (s.from_thousands || 0) && (s.to_thousands === null || thousandsRun <= s.to_thousands)
      );
      if (matchedScale) runCostPerThousand = matchedScale.price_per_unit;
    } else if (activeMachine.print_price) {
      runCostPerThousand = Number(activeMachine.print_price);
    }
  }

  const pressSetupCost = passes > 0 ? (activeMachine?.print_price_fixed ? Number(activeMachine.print_price_fixed) : 450.0) : 0;
  const pressRunCost = thousandsRun * runCostPerThousand;
  const totalPressCost = pressSetupCost + pressRunCost;

  // 8. Recubrimientos / Acabados
  let coatingCost = 0;
  if (finish === 'barniz_maquina') {
    coatingCost = Number((grossSheets * 0.45).toFixed(2));
  } else if (finish === 'uv_registro') {
    const uvService = config?.services?.find((s) => s.category === 'recubrimientos' && s.name.toLowerCase().includes('uv'));
    const uvRate = uvService?.price ? Number(uvService.price) : 2.80;
    coatingCost = Number((grossSheets * uvRate).toFixed(2));
  } else if (finish === 'plastificado_mate' || finish === 'plastificado_brillante') {
    const lamService = config?.services?.find((s) => s.category === 'recubrimientos' && s.name.toLowerCase().includes('plastific'));
    const lamRate = lamService?.price ? Number(lamService.price) : 1.75;
    coatingCost = Number((grossSheets * lamRate).toFixed(2));
  }

  // 9. Suaje (Troquel Láser) y Troquelado
  // Base de suaje + plecas proporcionales a las poses
  let dieManufacturingCost = 0;
  if (!hasExistingDie) {
    const suajeService = config?.services?.find((s) => s.category === 'acabados' && s.name.toLowerCase().includes('suaje'));
    const baseDiePrice = suajeService?.min_price ? Number(suajeService.min_price) : 950.0;
    // Cada pose adicional agrega metraje de pleca de acero:
    const totalRuleMetersInDie = boxFlat.totalRuleMeters * imposition.piecesPerSheet;
    // $190 por metro de cuchilla templada de corte y hendido
    const ruleCost = totalRuleMetersInDie * 190;
    dieManufacturingCost = Math.max(baseDiePrice, Number((baseDiePrice * 0.5 + ruleCost).toFixed(2)));
  }

  // Puesta a punto de troqueladora y tiro de golpes
  const dieSetupCost = 350.0; // Arreglo de platina con matriz y contraplatina
  const dieThousandRate = 180.0; // Costo por millar de pliegos troquelados
  const dieThousands = Math.max(1, Math.ceil(grossSheets / 1000));
  const dieRunCost = dieThousands * dieThousandRate;
  const totalDieCost = dieManufacturingCost + dieSetupCost + dieRunCost;

  // 10. Pegado (Lineal o Fondo Automático)
  const isAuto = boxType === 'automatico';
  const gluingSetupCost = isAuto ? 500.0 : 300.0; // Puesta a punto de bandas y guías
  const gluingThousandRate = isAuto ? 220.0 : 140.0; // $/millar de cajas pegadas
  const boxThousands = Math.max(1, Math.ceil(quantity / 1000));
  const gluingRunCost = boxThousands * gluingThousandRate;
  const totalGluingCost = gluingSetupCost + gluingRunCost;

  // 11. Costos Directos y Totales con Margen de Utilidad
  const directCost = Number(
    (
      totalSubstrateCost +
      platesCost +
      totalPressCost +
      coatingCost +
      totalDieCost +
      totalGluingCost
    ).toFixed(2)
  );

  // Margen industrial comercial estándar: 38%
  const suggestedTotal = Number((directCost * 1.38).toFixed(2));
  const unitPrice = quantity > 0 ? Number((suggestedTotal / quantity).toFixed(2)) : 0;

  // 12. Escala comparativa de volúmenes (500, 1000, 2500, 5000, 10000)
  const computeVolumeTotal = (qty: number) => {
    const nSh = Math.ceil(qty / imposition.piecesPerSheet);
    const pSetup = pressSetupSheets;
    const pRun = Math.max(25, Math.ceil(nSh * 0.03));
    const cWaste = finish !== 'none' ? Math.max(15, Math.ceil(nSh * 0.025)) : 0;
    const dSetup = dieSetupSheets;
    const dRun = Math.max(15, Math.ceil(nSh * 0.015));
    const gWaste = Math.ceil(nSh * 0.015);
    const gSh = nSh + pSetup + pRun + cWaste + dSetup + dRun + gWaste;

    const subCost = gSh * substratePricePerSheet;
    const prRun = Math.max(1, Math.ceil((gSh * passes) / 1000)) * runCostPerThousand;
    const prTotal = (passes > 0 ? pressSetupCost : 0) + prRun;
    let coat = 0;
    if (finish === 'barniz_maquina') coat = gSh * 0.45;
    else if (finish === 'uv_registro') coat = gSh * 2.80;
    else if (finish.includes('plastificado')) coat = gSh * 1.75;

    const dRunTotal = Math.max(1, Math.ceil(gSh / 1000)) * dieThousandRate;
    const dTotal = dieManufacturingCost + dieSetupCost + dRunTotal;
    const glRunTotal = Math.max(1, Math.ceil(qty / 1000)) * gluingThousandRate;
    const glTotal = gluingSetupCost + glRunTotal;

    const dCost = subCost + platesCost + prTotal + coat + dTotal + glTotal;
    return Number((dCost * 1.38).toFixed(2));
  };

  const priceScale = [
    { qty: 500, total: computeVolumeTotal(500), unitPrice: Number((computeVolumeTotal(500) / 500).toFixed(2)) },
    { qty: 1000, total: computeVolumeTotal(1000), unitPrice: Number((computeVolumeTotal(1000) / 1000).toFixed(2)) },
    { qty: 2500, total: computeVolumeTotal(2500), unitPrice: Number((computeVolumeTotal(2500) / 2500).toFixed(2)) },
    { qty: 5000, total: computeVolumeTotal(5000), unitPrice: Number((computeVolumeTotal(5000) / 5000).toFixed(2)) },
    { qty: 10000, total: computeVolumeTotal(10000), unitPrice: Number((computeVolumeTotal(10000) / 10000).toFixed(2)) },
  ];

  // 13. Partidas de Cotización Técnicas
  const boxTypeNameMap: Record<PackagingBoxType, string> = {
    lineal: 'Pegado Lineal (Solapas estándar)',
    automatico: 'Fondo Automático (Crash-Lock)',
    semi_automatico: 'Semi-Automático (Snap-Lock 1-2-3)',
  };

  const items: Omit<QuoteItem, 'id' | 'quote_id'>[] = [
    {
      description: `Sustrato ${substrate} en pliego extendido (${netSheets} pliegos netos + ${totalWasteSheets} merma = ${grossSheets} pliegos brutos)`,
      quantity: grossSheets,
      unit: 'Pliego',
      unit_price: substratePricePerSheet,
      substrate_finishing: `${imposition.piecesPerSheet} piezas por pliego (${imposition.isRotated ? 'Girada 90°' : 'Normal'}) · Aprovechamiento: ${imposition.sheetUtilizationPercent}%`,
      subtotal: totalSubstrateCost,
    },
  ];

  if (platesCount > 0 && platesCost > 0) {
    items.push({
      description: `Preprensa térmica y juegos de placas CTP (${platesCount} placas para tintas ${inks})`,
      quantity: platesCount,
      unit: 'Placa CTP',
      unit_price: pricePerPlate,
      substrate_finishing: `Curvas de ganancia de punto calibradas para empaque plegadizo`,
      subtotal: platesCost,
    });
  }

  if (totalPressCost > 0) {
    items.push({
      description: `Impresión offset de alta definición (${thousandsRun} millar${thousandsRun > 1 ? 'es' : ''} de tiro en pliego extendido)`,
      quantity: Math.max(1, thousandsRun),
      unit: 'Millar',
      unit_price: Number((totalPressCost / Math.max(1, thousandsRun)).toFixed(2)),
      substrate_finishing: `Prensa 4 torres a registro exacto con guías de troquel`,
      subtotal: totalPressCost,
    });
  }

  if (coatingCost > 0) {
    const coatName =
      finish === 'uv_registro'
        ? 'Barniz UV a registro de alto brillo'
        : finish === 'plastificado_mate'
        ? 'Plastificado térmico BOPP mate (1 cara exterior)'
        : finish === 'plastificado_brillante'
        ? 'Plastificado térmico BOPP brillante (1 cara exterior)'
        : 'Barniz de sobreimpresión de máquina protector';

    items.push({
      description: coatName,
      quantity: grossSheets,
      unit: 'Pliego',
      unit_price: Number((coatingCost / grossSheets).toFixed(2)),
      substrate_finishing: 'Protección contra roce y resistencia a fricción en plegado',
      subtotal: coatingCost,
    });
  }

  if (!hasExistingDie && dieManufacturingCost > 0) {
    items.push({
      description: `Elaboración de suaje láser nuevo (${imposition.piecesPerSheet} figuras en pliego, ${boxFlat.totalRuleMeters}m de cuchilla por figura)`,
      quantity: 1,
      unit: 'Servicio',
      unit_price: dieManufacturingCost,
      substrate_finishing: 'Matriz de madera abedul multiplex con cuchilla templada y plecas de hendido',
      subtotal: dieManufacturingCost,
    });
  }

  items.push({
    description: `Proceso de troquelado y desbarbe en platina computarizada (${grossSheets} golpes a registro)`,
    quantity: Math.max(1, Math.ceil(grossSheets / 1000)),
    unit: 'Millar',
    unit_price: Number(((dieSetupCost + dieRunCost) / Math.max(1, Math.ceil(grossSheets / 1000))).toFixed(2)),
    substrate_finishing: `Arreglo de matriz y contraplatina para plecado nítido`,
    subtotal: Number((dieSetupCost + dieRunCost).toFixed(2)),
  });

  items.push({
    description: `Encolado y doblado mecanizado: Caja ${boxTypeNameMap[boxType]} (${quantity} piezas)`,
    quantity,
    unit: 'Pza',
    unit_price: Number((totalGluingCost / quantity).toFixed(2)),
    substrate_finishing: isAuto ? 'Pegadora automática multipunto con adhesivo vinílico y hotmelt' : 'Pegado lineal de solapa lateral',
    subtotal: totalGluingCost,
  });

  return {
    boxFlat,
    imposition,
    netSheets,
    waste,
    grossSheets,
    substratePricePerSheet,
    totalSubstrateCost,
    platesCount,
    platesCost,
    pressSetupCost,
    pressRunCost,
    totalPressCost,
    coatingCost,
    dieManufacturingCost,
    dieSetupCost,
    dieRunCost,
    totalDieCost,
    gluingSetupCost,
    gluingRunCost,
    totalGluingCost,
    directCost,
    suggestedTotal,
    unitPrice,
    priceScale,
    items,
  };
}
