import React, { useState } from 'react';
import { PaperType, PaperGrammage } from '../../../types';
import { Plus, Check, ChevronDown, X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

interface Step4PapersPart2Props {
  papers: PaperType[];
  onUpdatePapers: (papers: PaperType[]) => void;
  onPrev: () => void;
  onNext: (updatedPapers?: PaperType[]) => void;
}

export interface GrammageSizePreset {
  width_cm: number;
  height_cm: number;
  kg_per_thousand: number;
  suggested_price: number;
}

export interface PaperPresetGrammages {
  [grammage: number]: GrammageSizePreset[];
}

/**
 * Función oficial de formateo de moneda con separador de miles en pesos mexicanos (MXN)
 * Ejemplo: $1,250 o $1,250.50
 */
export const formatCurrency = (val: number): string => {
  const hasDecimals = val % 1 !== 0;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(val);
};

export const formatKg = (val: number): string => {
  return `${Number(val.toFixed(2))} kg/millar`;
};

/**
 * Presets exactos para Papel Bond según las imágenes de referencia
 * (60g con +1 más, 70g, 75g, 90g y 120g)
 */
export const BOND_PRESET_GRAMMAGES: PaperPresetGrammages = {
  60: [
    { width_cm: 57, height_cm: 87, kg_per_thousand: 29.75, suggested_price: 788 },
  ],
  70: [
    { width_cm: 57, height_cm: 87, kg_per_thousand: 34.71, suggested_price: 920 },
    { width_cm: 61, height_cm: 90, kg_per_thousand: 38.43, suggested_price: 1018 },
    { width_cm: 70, height_cm: 95, kg_per_thousand: 46.55, suggested_price: 1234 },
  ],
  75: [
    { width_cm: 57, height_cm: 87, kg_per_thousand: 37.19, suggested_price: 986 },
    { width_cm: 61, height_cm: 90, kg_per_thousand: 41.18, suggested_price: 1091 },
    { width_cm: 70, height_cm: 95, kg_per_thousand: 49.87, suggested_price: 1322 },
  ],
  90: [
    { width_cm: 57, height_cm: 87, kg_per_thousand: 44.63, suggested_price: 1183 },
    { width_cm: 61, height_cm: 90, kg_per_thousand: 49.41, suggested_price: 1309 },
    { width_cm: 70, height_cm: 95, kg_per_thousand: 59.85, suggested_price: 1586 },
  ],
  120: [
    { width_cm: 57, height_cm: 87, kg_per_thousand: 59.51, suggested_price: 1577 },
    { width_cm: 61, height_cm: 90, kg_per_thousand: 65.88, suggested_price: 1746 },
    { width_cm: 70, height_cm: 95, kg_per_thousand: 79.80, suggested_price: 2115 },
  ],
};

/**
 * Presets exactos para Couché extraídos de las imágenes de referencia
 * 130g, 150g, 200g, 250g y 300g (desbloqueado con +1 más)
 */
export const COUCHE_PRESET_GRAMMAGES: PaperPresetGrammages = {
  130: [
    { width_cm: 57, height_cm: 87, kg_per_thousand: 64.47, suggested_price: 1580 },
    { width_cm: 61, height_cm: 90, kg_per_thousand: 71.37, suggested_price: 1749 },
    { width_cm: 70, height_cm: 95, kg_per_thousand: 86.45, suggested_price: 2118 },
  ],
  150: [
    { width_cm: 58, height_cm: 88, kg_per_thousand: 76.56, suggested_price: 1876 },
    { width_cm: 61, height_cm: 90, kg_per_thousand: 82.35, suggested_price: 2018 },
    { width_cm: 70, height_cm: 95, kg_per_thousand: 99.75, suggested_price: 2444 },
  ],
  200: [
    { width_cm: 58, height_cm: 88, kg_per_thousand: 102.08, suggested_price: 2501 },
    { width_cm: 61, height_cm: 90, kg_per_thousand: 109.80, suggested_price: 2690 },
    { width_cm: 70, height_cm: 95, kg_per_thousand: 133.00, suggested_price: 3259 },
  ],
  250: [
    { width_cm: 58, height_cm: 88, kg_per_thousand: 127.60, suggested_price: 3126 },
    { width_cm: 61, height_cm: 90, kg_per_thousand: 137.25, suggested_price: 3363 },
    { width_cm: 70, height_cm: 95, kg_per_thousand: 166.25, suggested_price: 4073 },
  ],
  300: [
    { width_cm: 58, height_cm: 88, kg_per_thousand: 153.12, suggested_price: 3751 },
    { width_cm: 61, height_cm: 90, kg_per_thousand: 164.70, suggested_price: 4035 },
    { width_cm: 70, height_cm: 95, kg_per_thousand: 199.50, suggested_price: 4888 },
  ],
};

/**
 * Presets exactos para Opalina extraídos de las imágenes de referencia
 */
export const OPALINA_PRESET_GRAMMAGES: PaperPresetGrammages = {
  120: [
    { width_cm: 57, height_cm: 87, kg_per_thousand: 59.51, suggested_price: 4047 },
    { width_cm: 70, height_cm: 95, kg_per_thousand: 79.80, suggested_price: 5426 },
  ],
  220: [
    { width_cm: 57, height_cm: 87, kg_per_thousand: 109.10, suggested_price: 7419 },
    { width_cm: 70, height_cm: 95, kg_per_thousand: 146.30, suggested_price: 9948 },
  ],
  240: [
    { width_cm: 52, height_cm: 72, kg_per_thousand: 89.86, suggested_price: 6110 },
  ],
};

/**
 * Presets exactos para Micro Flauta E
 */
export const MICRO_FLAUTA_E_PRESET_GRAMMAGES: PaperPresetGrammages = {
  400: [
    { width_cm: 36, height_cm: 50, kg_per_thousand: 72.0, suggested_price: 1584 },
    { width_cm: 51, height_cm: 73, kg_per_thousand: 148.92, suggested_price: 3276 },
    { width_cm: 71, height_cm: 101, kg_per_thousand: 286.84, suggested_price: 6310 },
  ],
};

/**
 * Presets exactos para Micro Flauta F (Imagen 1 de referencia)
 * 320g:
 * 36×50 cm · 57.6 kg/millar · $1,843
 * 51×73 cm · 119.14 kg/millar · $3,812
 * 71×101 cm · 229.47 kg/millar · $7,343
 */
export const MICRO_FLAUTA_F_PRESET_GRAMMAGES: PaperPresetGrammages = {
  320: [
    { width_cm: 36, height_cm: 50, kg_per_thousand: 57.6, suggested_price: 1843 },
    { width_cm: 51, height_cm: 73, kg_per_thousand: 119.14, suggested_price: 3812 },
    { width_cm: 71, height_cm: 101, kg_per_thousand: 229.47, suggested_price: 7343 },
  ],
};

/**
 * Presets exactos para Multicapa (Imágenes 2 a 8 de referencia)
 * 12 pts · 215g: 70×95 ($3,574), 70×96 ($3,612), 90×125 ($6,047)
 * 14 pts · 235g: 70×95 ($3,907), 71×125 ($5,214), 90×125 ($6,610)
 * 16 pts · 270g: 71×125 ($5,991), 90×125 ($7,594)
 * 18 pts · 295g: 90×125 ($8,297)
 * 20 pts · 325g: 71×125 ($7,211), 90×125 ($9,141)
 * 22 pts · 350g: 90×125 ($9,844)
 * 24 pts · 380g: 90×125 ($10,688)
 */
export const MULTICAPA_PRESET_GRAMMAGES: PaperPresetGrammages = {
  215: [
    { width_cm: 70, height_cm: 95, kg_per_thousand: 142.97, suggested_price: 3574 },
    { width_cm: 70, height_cm: 96, kg_per_thousand: 144.48, suggested_price: 3612 },
    { width_cm: 90, height_cm: 125, kg_per_thousand: 241.88, suggested_price: 6047 },
  ],
  235: [
    { width_cm: 70, height_cm: 95, kg_per_thousand: 156.27, suggested_price: 3907 },
    { width_cm: 71, height_cm: 125, kg_per_thousand: 208.56, suggested_price: 5214 },
    { width_cm: 90, height_cm: 125, kg_per_thousand: 264.38, suggested_price: 6610 },
  ],
  270: [
    { width_cm: 71, height_cm: 125, kg_per_thousand: 239.62, suggested_price: 5991 },
    { width_cm: 90, height_cm: 125, kg_per_thousand: 303.75, suggested_price: 7594 },
  ],
  295: [
    { width_cm: 90, height_cm: 125, kg_per_thousand: 331.88, suggested_price: 8297 },
  ],
  325: [
    { width_cm: 71, height_cm: 125, kg_per_thousand: 288.44, suggested_price: 7211 },
    { width_cm: 90, height_cm: 125, kg_per_thousand: 365.62, suggested_price: 9141 },
  ],
  350: [
    { width_cm: 90, height_cm: 125, kg_per_thousand: 393.75, suggested_price: 9844 },
  ],
  380: [
    { width_cm: 90, height_cm: 125, kg_per_thousand: 427.5, suggested_price: 10688 },
  ],
};

/**
 * Etiquetas personalizadas de puntos y gramos para Multicapa (Imágenes 2 a 8)
 */
export const MULTICAPA_LABELS: Record<number, string> = {
  215: '12 pts · 215g',
  235: '14 pts · 235g',
  270: '16 pts · 270g',
  295: '18 pts · 295g',
  325: '20 pts · 325g',
  350: '22 pts · 350g',
  380: '24 pts · 380g',
};

/**
 * Presets exactos para Corrugado Flauta B / Micro Flauta B
 */
export const CORRUGADO_FLAUTA_B_PRESET_GRAMMAGES: PaperPresetGrammages = {
  450: [
    { width_cm: 36, height_cm: 50, kg_per_thousand: 81.0, suggested_price: 1296 },
    { width_cm: 51, height_cm: 73, kg_per_thousand: 167.53, suggested_price: 2680 },
    { width_cm: 71, height_cm: 101, kg_per_thousand: 322.69, suggested_price: 5163 },
  ],
};

/**
 * Presets exactos para Bristol
 */
export const BRISTOL_PRESET_GRAMMAGES: PaperPresetGrammages = {
  170: [
    { width_cm: 50, height_cm: 65, kg_per_thousand: 55.25, suggested_price: 1823 },
  ],
  190: [
    { width_cm: 50, height_cm: 66, kg_per_thousand: 62.7, suggested_price: 2069 },
  ],
};

/**
 * Presets exactos para Autoadherible
 */
export const AUTOADHERIBLE_PRESET_GRAMMAGES: PaperPresetGrammages = {
  185: [
    { width_cm: 33, height_cm: 48, kg_per_thousand: 29.3, suggested_price: 2110 },
    { width_cm: 48, height_cm: 66, kg_per_thousand: 58.61, suggested_price: 4220 },
    { width_cm: 51, height_cm: 66, kg_per_thousand: 62.27, suggested_price: 4483 },
  ],
};

/**
 * Presets exactos para Autocopiable
 */
export const AUTOCOPIABLE_PRESET_GRAMMAGES: PaperPresetGrammages = {
  75: [
    { width_cm: 57, height_cm: 87, kg_per_thousand: 37.19, suggested_price: 2417 },
    { width_cm: 70, height_cm: 95, kg_per_thousand: 49.87, suggested_price: 3242 },
    { width_cm: 72, height_cm: 87, kg_per_thousand: 46.98, suggested_price: 3054 },
  ],
  80: [
    { width_cm: 57, height_cm: 87, kg_per_thousand: 39.67, suggested_price: 2579 },
    { width_cm: 70, height_cm: 95, kg_per_thousand: 53.2, suggested_price: 3458 },
    { width_cm: 72, height_cm: 87, kg_per_thousand: 50.11, suggested_price: 3257 },
  ],
  85: [
    { width_cm: 57, height_cm: 87, kg_per_thousand: 42.15, suggested_price: 2740 },
    { width_cm: 70, height_cm: 95, kg_per_thousand: 56.53, suggested_price: 3674 },
    { width_cm: 72, height_cm: 87, kg_per_thousand: 53.24, suggested_price: 3461 },
  ],
};

/**
 * Presets exactos para Linner Kraft
 */
export const LINNER_KRAFT_PRESET_GRAMMAGES: PaperPresetGrammages = {
  130: [
    { width_cm: 70, height_cm: 95, kg_per_thousand: 86.45, suggested_price: 1643 },
    { width_cm: 71, height_cm: 125, kg_per_thousand: 115.38, suggested_price: 2192 },
    { width_cm: 90, height_cm: 125, kg_per_thousand: 146.25, suggested_price: 2779 },
  ],
  140: [
    { width_cm: 70, height_cm: 95, kg_per_thousand: 93.1, suggested_price: 1769 },
    { width_cm: 71, height_cm: 125, kg_per_thousand: 124.25, suggested_price: 2361 },
    { width_cm: 90, height_cm: 125, kg_per_thousand: 157.5, suggested_price: 2993 },
  ],
  185: [
    { width_cm: 70, height_cm: 95, kg_per_thousand: 123.03, suggested_price: 2338 },
    { width_cm: 71, height_cm: 125, kg_per_thousand: 164.19, suggested_price: 3120 },
    { width_cm: 90, height_cm: 125, kg_per_thousand: 208.13, suggested_price: 3954 },
  ],
};

export const Step4PapersPart2: React.FC<Step4PapersPart2Props> = ({
  papers,
  onUpdatePapers,
  onPrev,
  onNext,
}) => {
  // Filtramos solo los papeles seleccionados por el usuario
  const activePapers = papers.filter((p) => p.selected);

  // Mapeo de si el usuario ha pulsado "+1 más" o "+3 más" para cada familia
  const [unlockedPlusMap, setUnlockedPlusMap] = useState<Record<string, boolean>>({});

  // Regla estricta: NINGÚN gramaje seleccionado por defecto al ingresar
  const [activeGrammageMap, setActiveGrammageMap] = useState<Record<string, number | null>>({});

  // Mapeo de modo de cobro para sustratos especiales (millar vs cm2)
  const [pricingModeMap, setPricingModeMap] = useState<Record<string, 'millar' | 'cm2'>>({});

  // Estado para el modal/formulario de "Agregar gramaje"
  const [addingGrammageForPaperId, setAddingGrammageForPaperId] = useState<string | null>(null);
  const [customGrammageValue, setCustomGrammageValue] = useState<string>('120');
  const [customWidth, setCustomWidth] = useState<string>('58');
  const [customHeight, setCustomHeight] = useState<string>('88');
  const [customPrice, setCustomPrice] = useState<string>('1000');
  const [customMaterial, setCustomMaterial] = useState<string>('');
  const [customObservations, setCustomObservations] = useState<string>('');

  // Estado para edición inline de precio
  const [editingPriceKey, setEditingPriceKey] = useState<string | null>(null);
  const [editedPriceValue, setEditedPriceValue] = useState<string>('');

  /**
   * Helper para identificar familias
   */
  const getPaperFamilyInfo = (paper: PaperType) => {
    const code = (paper.code || '').toUpperCase();
    const name = (paper.name || '').toLowerCase();

    const isBond = code === 'BON' || name.includes('bond');
    const isCouche = code === 'COU' || name.includes('couché') || name.includes('couche');
    const isOpalina = code === 'OPA' || name.includes('opalina');
    const isMicroFlautaE = code === 'MIC' || name.includes('micro flauta e') || (name.includes('flauta e') && !name.includes('flauta f'));
    const isMicroFlautaF = code === 'MIF' || name.includes('micro flauta f') || name.includes('flauta f');
    const isCorrugadoB = code === 'COR' || name.includes('flauta b') || name.includes('corrugado');
    const isBristol = code === 'BRI' || name.includes('bristol');
    const isAutoadherible = code === 'ADH' || name.includes('autoadherible');
    const isAutocopiable = code === 'ACP' || name.includes('autocopiable');
    const isLinnerKraft = code === 'LKR' || name.includes('kraft') || name.includes('linner');
    const isMulticapa = code === 'MUL' || name.includes('multicapa');

    const isFlauta = isMicroFlautaE || isCorrugadoB;

    return {
      isBond,
      isCouche,
      isOpalina,
      isMicroFlautaE,
      isMicroFlautaF,
      isCorrugadoB,
      isBristol,
      isAutoadherible,
      isAutocopiable,
      isLinnerKraft,
      isMulticapa,
      isFlauta,
    };
  };

  /**
   * Obtiene la lista de botones de gramaje a mostrar para una familia de papel
   */
  const getVisibleGrammagesForPaper = (paper: PaperType): number[] => {
    const info = getPaperFamilyInfo(paper);
    const isUnlocked = !!unlockedPlusMap[paper.id];

    let baseGrammages: number[] = [];

    if (info.isBond) {
      baseGrammages = isUnlocked ? [60, 70, 75, 90, 120] : [70, 75, 90, 120];
    } else if (info.isCouche) {
      baseGrammages = isUnlocked ? [130, 150, 200, 250, 300] : [130, 150, 200, 250];
    } else if (info.isOpalina) {
      baseGrammages = [120, 220, 240];
    } else if (info.isMicroFlautaE) {
      baseGrammages = [400];
    } else if (info.isMicroFlautaF) {
      baseGrammages = [320];
    } else if (info.isMulticapa) {
      // 12 pts · 215g, 14 pts · 235g, 16 pts · 270g, 20 pts · 325g
      // +3 más agrega: 18 pts · 295g, 22 pts · 350g, 24 pts · 380g
      baseGrammages = isUnlocked
        ? [215, 235, 270, 325, 295, 350, 380]
        : [215, 235, 270, 325];
      const existing = paper.grammages.map((g) => Number(g.grammage)).filter(Boolean);
      return Array.from(new Set([...baseGrammages, ...existing]));
    } else if (info.isCorrugadoB) {
      baseGrammages = [450];
    } else if (info.isBristol) {
      baseGrammages = [170, 190];
    } else if (info.isAutoadherible) {
      baseGrammages = [185];
    } else if (info.isAutocopiable) {
      baseGrammages = [75, 80, 85];
    } else if (info.isLinnerKraft) {
      baseGrammages = [130, 140, 185];
    } else {
      baseGrammages = [75, 90, 120];
    }

    // Incluir gramajes personalizados que el usuario haya agregado
    const existing = paper.grammages.map((g) => Number(g.grammage)).filter(Boolean);
    const set = new Set([...baseGrammages, ...existing]);
    return Array.from(set).sort((a, b) => a - b);
  };

  /**
   * Obtiene la etiqueta visible para un gramaje (soporta puntos para Multicapa)
   */
  const getGrammageLabel = (paper: PaperType, grammage: number): string => {
    const info = getPaperFamilyInfo(paper);
    if (info.isMulticapa && MULTICAPA_LABELS[grammage]) {
      return MULTICAPA_LABELS[grammage];
    }
    return `${grammage}g`;
  };

  /**
   * Obtiene las medidas y precios sugeridos para el gramaje seleccionado
   */
  const getPresetsForGrammage = (paper: PaperType, grammage: number): GrammageSizePreset[] => {
    const info = getPaperFamilyInfo(paper);

    if (info.isBond && BOND_PRESET_GRAMMAGES[grammage]) {
      return BOND_PRESET_GRAMMAGES[grammage];
    }
    if (info.isCouche && COUCHE_PRESET_GRAMMAGES[grammage]) {
      return COUCHE_PRESET_GRAMMAGES[grammage];
    }
    if (info.isOpalina && OPALINA_PRESET_GRAMMAGES[grammage]) {
      return OPALINA_PRESET_GRAMMAGES[grammage];
    }
    if (info.isMicroFlautaE && MICRO_FLAUTA_E_PRESET_GRAMMAGES[grammage]) {
      return MICRO_FLAUTA_E_PRESET_GRAMMAGES[grammage];
    }
    if (info.isMicroFlautaF && MICRO_FLAUTA_F_PRESET_GRAMMAGES[grammage]) {
      return MICRO_FLAUTA_F_PRESET_GRAMMAGES[grammage];
    }
    if (info.isMulticapa && MULTICAPA_PRESET_GRAMMAGES[grammage]) {
      return MULTICAPA_PRESET_GRAMMAGES[grammage];
    }
    if (info.isCorrugadoB && CORRUGADO_FLAUTA_B_PRESET_GRAMMAGES[grammage]) {
      return CORRUGADO_FLAUTA_B_PRESET_GRAMMAGES[grammage];
    }
    if (info.isBristol && BRISTOL_PRESET_GRAMMAGES[grammage]) {
      return BRISTOL_PRESET_GRAMMAGES[grammage];
    }
    if (info.isAutoadherible && AUTOADHERIBLE_PRESET_GRAMMAGES[grammage]) {
      return AUTOADHERIBLE_PRESET_GRAMMAGES[grammage];
    }
    if (info.isAutocopiable && AUTOCOPIABLE_PRESET_GRAMMAGES[grammage]) {
      return AUTOCOPIABLE_PRESET_GRAMMAGES[grammage];
    }
    if (info.isLinnerKraft && LINNER_KRAFT_PRESET_GRAMMAGES[grammage]) {
      return LINNER_KRAFT_PRESET_GRAMMAGES[grammage];
    }

    // Cálculo dinámico para gramajes personalizados
    const stdSizes = [
      { w: 58, h: 88 },
      { w: 61, h: 90 },
      { w: 70, h: 95 },
    ];

    return stdSizes.map(({ w, h }) => {
      const kg = Number(((w / 100) * (h / 100) * grammage).toFixed(2));
      const suggested = Math.round(kg * 24.5);
      return {
        width_cm: w,
        height_cm: h,
        kg_per_thousand: kg,
        suggested_price: suggested,
      };
    });
  };

  /**
   * Verifica si una medida de un gramaje ya fue agregada por el usuario
   */
  const isPresetConfiguredInPaper = (
    paper: PaperType,
    grammage: number,
    preset: GrammageSizePreset
  ): PaperGrammage | undefined => {
    return paper.grammages.find(
      (g) =>
        Number(g.grammage) === grammage &&
        Number(g.width_cm) === preset.width_cm &&
        Number(g.height_cm) === preset.height_cm
    );
  };

  /**
   * Alterna el estado de agregación de un preset (Botón Agregar / Agregado)
   */
  const handleToggleAddPreset = (
    paper: PaperType,
    grammage: number,
    preset: GrammageSizePreset
  ) => {
    const existing = isPresetConfiguredInPaper(paper, grammage, preset);

    let updatedGrammages: PaperGrammage[];
    if (existing) {
      updatedGrammages = paper.grammages.filter(
        (g) =>
          !(
            Number(g.grammage) === grammage &&
            Number(g.width_cm) === preset.width_cm &&
            Number(g.height_cm) === preset.height_cm
          )
      );
    } else {
      const newG: PaperGrammage = {
        id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        grammage,
        width_cm: preset.width_cm,
        height_cm: preset.height_cm,
        sheet_size: `${preset.width_cm}×${preset.height_cm} cm`,
        price_per_thousand: preset.suggested_price,
      };
      updatedGrammages = [...paper.grammages, newG];
    }

    const updatedPapers = papers.map((p) =>
      p.id === paper.id ? { ...p, grammages: updatedGrammages } : p
    );
    onUpdatePapers(updatedPapers);
  };

  /**
   * Al tocar un botón de gramaje (ej. 75g, 130g), abre sus medidas y si aún no tiene
   * ninguna medida agregada para ese gramaje, agrega automáticamente la primera medida estándar.
   */
  const handleSelectGrammagePill = (paper: PaperType, grammage: number) => {
    setActiveGrammageMap((prev) => ({
      ...prev,
      [paper.id]: grammage,
    }));

    const hasThisGrammageConfigured = (paper.grammages || []).some(
      (g) => Number(g.grammage) === grammage
    );

    if (!hasThisGrammageConfigured) {
      const presetsForG = getPresetsForGrammage(paper, grammage);
      if (presetsForG.length > 0) {
        const firstPreset = presetsForG[0];
        const newG: PaperGrammage = {
          id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          grammage,
          width_cm: firstPreset.width_cm,
          height_cm: firstPreset.height_cm,
          sheet_size: `${firstPreset.width_cm}×${firstPreset.height_cm} cm`,
          price_per_thousand: firstPreset.suggested_price,
        };
        const updatedPapers = papers.map((p) =>
          p.id === paper.id
            ? { ...p, selected: true, grammages: [...(p.grammages || []), newG] }
            : p
        );
        onUpdatePapers(updatedPapers);
      }
    }
  };

  /**
   * Al confirmar precios, garantiza que todo papel seleccionado tenga al menos un gramaje configurado
   */
  const handleConfirmPrices = () => {
    let changed = false;
    const finalPapers = papers.map((p) => {
      if (!p.selected) return p;
      if (p.grammages && p.grammages.length > 0) return p;

      const visibleG = getVisibleGrammagesForPaper(p);
      const targetGrammage = activeGrammageMap[p.id] || visibleG[0] || 90;
      const presetsForG = getPresetsForGrammage(p, targetGrammage);
      const firstPreset = presetsForG[0] || {
        width_cm: 57,
        height_cm: 87,
        kg_per_thousand: 44.63,
        suggested_price: 1183,
      };

      changed = true;
      return {
        ...p,
        grammages: [
          {
            id: `g-auto-${p.id}-${targetGrammage}`,
            grammage: targetGrammage,
            width_cm: firstPreset.width_cm,
            height_cm: firstPreset.height_cm,
            sheet_size: `${firstPreset.width_cm}×${firstPreset.height_cm} cm`,
            price_per_thousand: firstPreset.suggested_price,
          },
        ],
      };
    });

    if (changed) {
      onUpdatePapers(finalPapers);
    }
    onNext(finalPapers);
  };

  /**
   * Manejador del botón "+1 más" o "+3 más"
   * Habilita la opción correspondiente, la selecciona de inmediato,
   * y desaparece del DOM de forma definitiva.
   */
  const handlePlusClick = (paper: PaperType) => {
    const info = getPaperFamilyInfo(paper);

    // Marcar como desbloqueado para que desaparezca definitivamente
    setUnlockedPlusMap((prev) => ({ ...prev, [paper.id]: true }));

    if (info.isBond) {
      setActiveGrammageMap((prev) => ({ ...prev, [paper.id]: 60 }));
    } else if (info.isCouche) {
      setActiveGrammageMap((prev) => ({ ...prev, [paper.id]: 300 }));
    } else if (info.isMulticapa) {
      setActiveGrammageMap((prev) => ({ ...prev, [paper.id]: 295 }));
    }
  };

  /**
   * Modifica el precio unitario ingresado por el usuario
   */
  const handleUpdateConfiguredPrice = (
    paperId: string,
    grammage: number,
    width_cm: number,
    height_cm: number,
    newPrice: number
  ) => {
    const updatedPapers = papers.map((p) => {
      if (p.id !== paperId) return p;
      return {
        ...p,
        grammages: p.grammages.map((g) => {
          if (
            Number(g.grammage) === grammage &&
            Number(g.width_cm) === width_cm &&
            Number(g.height_cm) === height_cm
          ) {
            return { ...g, price_per_thousand: newPrice };
          }
          return g;
        }),
      };
    });

    onUpdatePapers(updatedPapers);
    setEditingPriceKey(null);
  };

  /**
   * Crea un nuevo gramaje/medida personalizado desde el formulario
   */
  const handleCreateCustomGrammage = (paperId: string) => {
    const grammageNum = Number(customGrammageValue);
    const widthNum = Number(customWidth) || 58;
    const heightNum = Number(customHeight) || 88;
    const priceNum = Number(customPrice) || 1000;

    if (!grammageNum || grammageNum <= 0) return;

    const newG: PaperGrammage = {
      id: `g-custom-${Date.now()}`,
      grammage: grammageNum,
      width_cm: widthNum,
      height_cm: heightNum,
      sheet_size: `${widthNum}×${heightNum} cm`,
      price_per_thousand: priceNum,
      material: customMaterial.trim() || undefined,
      notes: customObservations.trim() || undefined,
    };

    const updatedPapers = papers.map((p) => {
      if (p.id !== paperId) return p;
      return {
        ...p,
        grammages: [...p.grammages, newG].sort(
          (a, b) => Number(a.grammage) - Number(b.grammage)
        ),
      };
    });

    onUpdatePapers(updatedPapers);

    // Activar inmediatamente el nuevo gramaje y cerrar el formulario
    setActiveGrammageMap((prev) => ({ ...prev, [paperId]: grammageNum }));
    setAddingGrammageForPaperId(null);
    setCustomMaterial('');
    setCustomObservations('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#E9E4D9] shadow-sm flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-black tracking-widest text-[#10B981] uppercase font-sans">
          PASO 4 DE 5 · PRECIOS
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#262422] tracking-tight font-heading">
          Gramajes y precios
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Marca los gramajes que tienes y anota el precio por millar que pagas a tu proveedor.
        </p>
      </div>

      {/* Tip Callout Banner */}
      <div className="bg-[#FEF9EE] border border-[#F3E8C8] rounded-2xl p-4 flex items-center gap-3 text-xs sm:text-sm text-[#785412] leading-relaxed">
        <span className="text-base shrink-0">💡</span>
        <div>
          Precio por <strong className="font-bold text-[#5c3e08]">millar</strong> = lo que pagas por 1,000 pliegos. El app convierte a $/pliego solo.
        </div>
      </div>

      {/* List of Active Papers */}
      <div className="flex flex-col gap-6">
        {activePapers.map((paper) => {
          const info = getPaperFamilyInfo(paper);
          const visibleGrammages = getVisibleGrammagesForPaper(paper);

          // Ningún gramaje seleccionado por defecto; el usuario debe elegir manualmente
          const currentActiveGrammage = activeGrammageMap[paper.id] ?? null;

          const presets = currentActiveGrammage
            ? getPresetsForGrammage(paper, currentActiveGrammage)
            : [];

          // Botón "+1 más" o "+3 más"
          const isUnlocked = !!unlockedPlusMap[paper.id];
          const showPlusButton = ((info.isBond || info.isCouche) || info.isMulticapa) && !isUnlocked;
          const plusButtonText = info.isMulticapa ? '+3 más' : '+1 más';

          // Modo de cobro para flautas (millar vs cm2)
          const currentPricingMode = pricingModeMap[paper.id] || 'millar';

          return (
            <div
              key={paper.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col gap-4"
            >
              {/* Paper Top Title */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-black text-[#262422] tracking-tight font-heading">
                    {paper.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {/* Selector de modo de cobro para Micro Flautas */}
                  {info.isFlauta && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span>Lo cobro por</span>
                      <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                        <button
                          type="button"
                          onClick={() =>
                            setPricingModeMap((prev) => ({ ...prev, [paper.id]: 'millar' }))
                          }
                          className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                            currentPricingMode === 'millar'
                              ? 'bg-white text-[#047857] shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          millar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPricingModeMap((prev) => ({ ...prev, [paper.id]: 'cm2' }))
                          }
                          className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                            currentPricingMode === 'cm2'
                              ? 'bg-white text-[#047857] shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          cm²
                        </button>
                      </div>
                    </div>
                  )}

                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    configura <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Dashed Green Container */}
              <div className="border-2 border-dashed border-[#10B981]/50 bg-[#FAFBF9] rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
                {/* Micro Header */}
                <div className="text-[11px] font-black text-[#047857] tracking-wider uppercase">
                  GRAMAJES DEL CATÁLOGO — TOCA UNO PARA VER MEDIDAS
                </div>

                {/* Grammage Buttons Row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  {visibleGrammages.map((grammage) => {
                    const isActive = currentActiveGrammage === grammage;
                    const isConfiguredG = (paper.grammages || []).some(
                      (g) => Number(g.grammage) === grammage
                    );
                    const label = getGrammageLabel(paper, grammage);

                    return (
                      <button
                        key={grammage}
                        type="button"
                        onClick={() => handleSelectGrammagePill(paper, grammage)}
                        className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer select-none inline-flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-[#10B981] text-white shadow-xs ring-2 ring-[#10B981]/20 scale-105'
                            : isConfiguredG
                            ? 'bg-[#DCFCE7] border border-[#10B981] text-[#047857]'
                            : 'bg-white border border-slate-300 text-slate-700 hover:border-[#10B981] hover:text-[#10B981]'
                        }`}
                      >
                        {isConfiguredG && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{label}</span>
                      </button>
                    );
                  })}

                  {/* Botón "+1 más" o "+3 más": Al hacer clic, habilita la opción y desaparece del DOM */}
                  {showPlusButton && (
                    <button
                      type="button"
                      onClick={() => handlePlusClick(paper)}
                      className="px-3.5 py-1.5 rounded-full border border-dashed border-slate-300 bg-white text-slate-600 hover:border-[#10B981] hover:text-[#10B981] text-xs font-bold transition-all cursor-pointer"
                    >
                      {plusButtonText}
                    </button>
                  )}
                </div>

                {/* List of Sheet Sizes for the active Grammage - Únicamente al seleccionar un gramaje */}
                {currentActiveGrammage !== null && presets.length > 0 && (
                  <div className="flex flex-col gap-2.5 pt-1 animate-in fade-in duration-200">
                    {presets.map((preset) => {
                      const configured = isPresetConfiguredInPaper(
                        paper,
                        currentActiveGrammage,
                        preset
                      );
                      const isConfigured = !!configured;
                      const priceToDisplay = configured
                        ? configured.price_per_thousand
                        : preset.suggested_price;
                      const editKey = `${paper.id}-${currentActiveGrammage}-${preset.width_cm}-${preset.height_cm}`;
                      const isEditing = editingPriceKey === editKey;

                      return (
                        <div
                          key={`${preset.width_cm}x${preset.height_cm}`}
                          className={`p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            isConfigured
                              ? 'bg-white border-[#10B981]/40 shadow-xs'
                              : 'bg-[#FDFEFC] border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          {/* Medida y peso */}
                          <div className="flex flex-col">
                            <span className="text-sm sm:text-base font-black text-[#262422]">
                              {preset.width_cm}×{preset.height_cm} cm
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {formatKg(preset.kg_per_thousand)}
                            </span>
                          </div>

                          {/* Precio con formato y comas en separador de miles */}
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-bold text-slate-400">$</span>
                                  <input
                                    type="number"
                                    autoFocus
                                    value={editedPriceValue}
                                    onChange={(e) => setEditedPriceValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateConfiguredPrice(
                                          paper.id,
                                          currentActiveGrammage,
                                          preset.width_cm,
                                          preset.height_cm,
                                          Number(editedPriceValue) || priceToDisplay
                                        );
                                      } else if (e.key === 'Escape') {
                                        setEditingPriceKey(null);
                                      }
                                    }}
                                    className="w-20 px-2 py-0.5 border border-[#10B981] rounded text-sm font-black text-[#047857] outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateConfiguredPrice(
                                        paper.id,
                                        currentActiveGrammage,
                                        preset.width_cm,
                                        preset.height_cm,
                                        Number(editedPriceValue) || priceToDisplay
                                      )
                                    }
                                    className="p-1 text-[#10B981] hover:bg-[#DCFCE7] rounded"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isConfigured) {
                                      setEditingPriceKey(editKey);
                                      setEditedPriceValue(priceToDisplay.toString());
                                    }
                                  }}
                                  title={isConfigured ? 'Clic para editar precio' : ''}
                                  className={`text-right group ${
                                    isConfigured ? 'cursor-pointer' : 'cursor-default'
                                  }`}
                                >
                                  <span className="text-sm sm:text-base font-black text-[#047857] block">
                                    {formatCurrency(priceToDisplay)}
                                  </span>
                                  <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase block">
                                    SUGERIDO
                                  </span>
                                </button>
                              )}
                            </div>

                            {/* Botón + Agregar / Agregado */}
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleAddPreset(paper, currentActiveGrammage, preset)
                              }
                              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                                isConfigured
                                  ? 'bg-[#DCFCE7] text-[#047857] border border-[#10B981]/60 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                                  : 'bg-[#10B981] hover:bg-[#059669] text-white'
                              }`}
                            >
                              {isConfigured ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Agregado</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Agregar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Formulario Inline de Agregar Gramaje */}
                {addingGrammageForPaperId === paper.id && (
                  <div className="border-t border-dashed border-[#10B981]/50 pt-4 flex flex-col gap-3 animate-in fade-in duration-200">
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#262422]">
                      <input
                        type="number"
                        value={customGrammageValue}
                        onChange={(e) => setCustomGrammageValue(e.target.value)}
                        className="w-16 px-2 py-1.5 border border-[#10B981] rounded-lg text-center font-black text-[#262422] outline-none focus:ring-1 focus:ring-[#10B981]"
                      />
                      <span className="font-semibold text-slate-600">g ·</span>
                      <input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        className="w-14 px-2 py-1.5 border border-slate-300 rounded-lg text-center font-bold text-[#262422] outline-none focus:border-[#10B981]"
                      />
                      <span className="font-semibold text-slate-600">x</span>
                      <input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        className="w-14 px-2 py-1.5 border border-slate-300 rounded-lg text-center font-bold text-[#262422] outline-none focus:border-[#10B981]"
                      />
                      <span className="font-semibold text-slate-600">cm</span>
                      <span className="font-bold text-slate-700 ml-1">$</span>
                      <input
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-center font-black text-[#262422] outline-none focus:border-[#10B981]"
                      />
                      <span className="font-semibold text-slate-600">/millar</span>
                    </div>

                    <input
                      type="text"
                      placeholder="Material (opcional)"
                      value={customMaterial}
                      onChange={(e) => setCustomMaterial(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition-all"
                    />

                    <input
                      type="text"
                      placeholder="Observaciones (opcional)"
                      value={customObservations}
                      onChange={(e) => setCustomObservations(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition-all"
                    />

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCreateCustomGrammage(paper.id)}
                        className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                      >
                        Agregar
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingGrammageForPaperId(null)}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-600 hover:text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón "+ Agregar gramaje" o "+ Agregar medida" debajo del contenedor punteado */}
              {addingGrammageForPaperId !== paper.id && (
                <button
                  type="button"
                  onClick={() => {
                    setAddingGrammageForPaperId(paper.id);
                    setCustomGrammageValue(info.isFlauta ? '400' : '120');
                    setCustomWidth(info.isFlauta ? '36' : '58');
                    setCustomHeight(info.isFlauta ? '50' : '88');
                    setCustomPrice(info.isFlauta ? '1500' : '1000');
                    setCustomMaterial('');
                    setCustomObservations('');
                  }}
                  className="self-start flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#10B981] transition-colors cursor-pointer py-1"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>{info.isFlauta ? 'Agregar medida' : 'Agregar gramaje'}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón: Agregar una familia que me falta */}
      <button
        type="button"
        onClick={onPrev}
        className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-[#10B981] bg-white hover:bg-[#F0FDF4] rounded-2xl text-xs sm:text-sm font-bold text-slate-600 hover:text-[#10B981] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Agregar una familia que me falta</span>
      </button>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>← Cambiar tipos</span>
        </button>

        <button
          type="button"
          onClick={handleConfirmPrices}
          className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-[#10B981] hover:bg-[#059669] flex items-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Confirmar precios</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
