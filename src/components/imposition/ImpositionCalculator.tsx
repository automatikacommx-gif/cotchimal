import React, { useState, useMemo } from 'react';
import { 
  LayoutGrid, 
  RotateCw, 
  Layers, 
  Scissors, 
  ArrowRight, 
  Copy, 
  Check, 
  Sliders, 
  Info,
  Maximize2,
  Sparkles,
  Printer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ImpositionCalculatorProps {
  onApplyToQuote?: (params: {
    pieceWidth: number;
    pieceHeight: number;
    sheetWidth: number;
    sheetHeight: number;
    piecesPerSheet: number;
    layoutDescription: string;
  }) => void;
}

// Presets de piezas estándar (cm)
const PIECE_PRESETS = [
  { label: 'Tarjeta 9×5', w: 9, h: 5 },
  { label: '¼ carta 10.7×14', w: 10.7, h: 14 },
  { label: '½ carta 14×21.5', w: 14, h: 21.5 },
  { label: 'Carta 21.5×28', w: 21.5, h: 28 },
  { label: 'Postal 10×15', w: 10, h: 15 },
  { label: 'Díptico 8.5×5.5', w: 8.5, h: 5.5 },
  { label: 'Volante 10×21', w: 10, h: 21 },
  { label: 'Separador 5×18', w: 5, h: 18 },
];

// Presets de pliegos estándar (cm)
const SHEET_PRESETS = [
  { label: '70×95', w: 70, h: 95 },
  { label: '61×86', w: 61, h: 86 },
  { label: '57×87', w: 57, h: 87 },
  { label: '65×90', w: 65, h: 90 },
  { label: '90×115', w: 90, h: 115 },
  { label: 'CD102 72×102', w: 72, h: 102 },
  { label: 'Tabloide 33×48', w: 33, h: 48 },
];

export const ImpositionCalculator: React.FC<ImpositionCalculatorProps> = ({ onApplyToQuote }) => {
  // Medidas de la pieza (final) en cm
  const [pieceWidth, setPieceWidth] = useState<number>(9);
  const [pieceHeight, setPieceHeight] = useState<number>(5);

  // Medidas del pliego en cm
  const [sheetWidth, setSheetWidth] = useState<number>(70);
  const [sheetHeight, setSheetHeight] = useState<number>(95);

  // Parámetros técnicos de taller
  const [gripperCm, setGripperCm] = useState<number>(1.0); // Pinza
  const [bleedCm, setBleedCm] = useState<number>(0.3); // Sangría por lado
  const [gripperPosition, setGripperPosition] = useState<'height' | 'width'>('height');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Selector manual de orientación: 'auto' | 'normal' | 'rotated'
  const [selectedOrientationMode, setSelectedOrientationMode] = useState<'auto' | 'normal' | 'rotated'>('auto');

  // Tiraje para estimar pliegos
  const [targetRunQuantity, setTargetRunQuantity] = useState<number>(5000);
  const [copied, setCopied] = useState<boolean>(false);

  // Rotar pieza 90 grados
  const handleSwapPieceDimensions = () => {
    setPieceWidth(pieceHeight);
    setPieceHeight(pieceWidth);
  };

  // Rotar pliego 90 grados
  const handleSwapSheetDimensions = () => {
    setSheetWidth(sheetHeight);
    setSheetHeight(sheetWidth);
  };

  // =========================================================================
  // MOTOR DE CÁLCULO DE IMPOSICIÓN
  // =========================================================================
  const calculation = useMemo(() => {
    // Protección contra valores no válidos
    const pw = Math.max(0.1, Number(pieceWidth) || 1);
    const ph = Math.max(0.1, Number(pieceHeight) || 1);
    const sw = Math.max(1, Number(sheetWidth) || 10);
    const sh = Math.max(1, Number(sheetHeight) || 10);
    const grip = Math.max(0, Number(gripperCm) || 0);
    const bleed = Math.max(0, Number(bleedCm) || 0);

    // Dimensión efectiva de la pieza con sangrías
    // 0.3 cm por cada lado = 0.6 cm en cada dimensión
    const effPieceW = pw + bleed * 2;
    const effPieceH = ph + bleed * 2;

    // Área útil disponible en el pliego descontando la pinza
    // Si la pinza está en la altura (lo común en alimentación de prensa):
    const usableW_gripH = sw;
    const usableH_gripH = Math.max(0, sh - grip);

    // Si la pinza estuviese en el ancho:
    const usableW_gripW = Math.max(0, sw - grip);
    const usableH_gripW = sh;

    const usableW = gripperPosition === 'height' ? usableW_gripH : usableW_gripW;
    const usableH = gripperPosition === 'height' ? usableH_gripH : usableH_gripW;

    // -------------------------------------------------------------
    // Opción 1: Orientación NORMAL (ancho de pieza sobre ancho de pliego)
    // -------------------------------------------------------------
    const colsNormal = Math.floor(usableW / effPieceW);
    const rowsNormal = Math.floor(usableH / effPieceH);
    const totalNormal = Math.max(0, colsNormal * rowsNormal);

    // -------------------------------------------------------------
    // Opción 2: Orientación GIRADA 90° (alto de pieza sobre ancho de pliego)
    // -------------------------------------------------------------
    const colsRotated = Math.floor(usableW / effPieceH);
    const rowsRotated = Math.floor(usableH / effPieceW);
    const totalRotated = Math.max(0, colsRotated * rowsRotated);

    // Determinación del mejor acomodo
    const bestIsNormal = totalNormal >= totalRotated;
    const activeIsNormal = 
      selectedOrientationMode === 'auto' 
        ? bestIsNormal 
        : selectedOrientationMode === 'normal';

    const activeCols = activeIsNormal ? colsNormal : colsRotated;
    const activeRows = activeIsNormal ? rowsNormal : rowsRotated;
    const activeTotal = activeIsNormal ? totalNormal : totalRotated;
    const activeOrientationName = activeIsNormal ? 'Normal' : 'Girada 90°';
    const activePieceRenderW = activeIsNormal ? effPieceW : effPieceH;
    const activePieceRenderH = activeIsNormal ? effPieceH : effPieceW;

    // Métricas de aprovechamiento
    const totalSheetAreaCm2 = sw * sh;
    const netPieceAreaCm2 = pw * ph * activeTotal;
    const grossImposedAreaCm2 = (activeCols * activePieceRenderW) * (activeRows * activePieceRenderH);
    
    // Porcentaje de aprovechamiento real del pliego
    const utilizationPercent = totalSheetAreaCm2 > 0 
      ? Math.min(100, Math.round((netPieceAreaCm2 / totalSheetAreaCm2) * 1000) / 10)
      : 0;

    // Estimación de pliegos necesarios según tiraje
    const runQty = Math.max(1, Number(targetRunQuantity) || 1);
    const sheetsNeededNet = activeTotal > 0 ? Math.ceil(runQty / activeTotal) : 0;
    // Merma sugerida según tiraje (mínimo 50 pliegos para puesta a punto o ~4%)
    const wasteSheets = Math.max(15, Math.ceil(sheetsNeededNet * 0.04));
    const totalSheetsWithWaste = sheetsNeededNet + wasteSheets;

    return {
      sw,
      sh,
      pw,
      ph,
      grip,
      bleed,
      usableW,
      usableH,
      normal: {
        cols: colsNormal,
        rows: rowsNormal,
        total: totalNormal,
        pieceW: effPieceW,
        pieceH: effPieceH
      },
      rotated: {
        cols: colsRotated,
        rows: rowsRotated,
        total: totalRotated,
        pieceW: effPieceH,
        pieceH: effPieceW
      },
      bestIsNormal,
      activeIsNormal,
      activeCols,
      activeRows,
      activeTotal,
      activeOrientationName,
      activePieceRenderW,
      activePieceRenderH,
      utilizationPercent,
      totalSheetAreaCm2,
      netPieceAreaCm2,
      sheetsNeededNet,
      wasteSheets,
      totalSheetsWithWaste
    };
  }, [pieceWidth, pieceHeight, sheetWidth, sheetHeight, gripperCm, bleedCm, gripperPosition, selectedOrientationMode, targetRunQuantity]);

  // Copiar resumen al portapapeles
  const handleCopySummary = () => {
    const text = `📐 IMPOSICIÓN DE CORTE TALLER GRUPO CHIMAL
Pieza final: ${calculation.pw} × ${calculation.ph} cm
Pliego: ${calculation.sw} × ${calculation.sh} cm
Pinza: ${calculation.grip} cm | Sangría: ${calculation.bleed} cm por lado
-----------------------------------------
Rendimiento: ${calculation.activeTotal} piezas por pliego
Acomodo: ${calculation.activeCols} × ${calculation.activeRows} (${calculation.activeOrientationName})
Aprovechamiento: ${calculation.utilizationPercent}%
Pliegos calculados para ${targetRunQuantity} piezas: ${calculation.sheetsNeededNet} netos (+ ${calculation.wasteSheets} merma = ${calculation.totalSheetsWithWaste} totales)`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full pb-16">
      {/* Header de la Calculadora */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF4EE] border border-[#CDE5D5] text-[#0F5132] text-xs font-bold uppercase tracking-wider mb-2">
            <LayoutGrid className="w-3.5 h-3.5 text-[#198754]" />
            Ingeniería de Pre-Prensa
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1E2922] tracking-tight font-heading">
            Calculadora de imposición
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#475569] leading-relaxed">
            ¿Cuántas piezas caben en tu pliego? Mete la medida de la pieza y del pliego — la calculadora prueba las dos orientaciones, descuenta pinza y sangría, y te muestra el mejor acomodo con su diagrama.
          </p>
        </div>

        {/* Mini tarjeta gráfica decorativa de imposición (como en la imagen del usuario) */}
        <div className="hidden md:flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border-2 border-dashed border-[#A3D9B5] shadow-xs w-48 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 w-full">
            <div className="h-6 rounded-md bg-[#20C997]/80"></div>
            <div className="h-6 rounded-md bg-[#20C997]/80"></div>
            <div className="h-6 rounded-md bg-[#20C997]/80"></div>
            <div className="h-6 rounded-md bg-[#20C997]/80"></div>
            <div className="h-6 rounded-md bg-[#20C997]/80"></div>
            <div className="h-6 rounded-md bg-[#20C997]/80"></div>
          </div>
          {/* Zona vacía/merma con borde punteado */}
          <div className="w-full h-4 mt-1.5 rounded-md border border-dashed border-[#20C997]/60 bg-[#E8F8F2]"></div>
        </div>
      </div>

      {/* Grid Principal: 2 Columnas (Inputs a la izquierda, Resultados & Diagrama a la derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* ================================================================= */}
        {/* COLUMNA IZQUIERDA: CONFIGURADOR Y MEDIDAS                         */}
        {/* ================================================================= */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-[#FAF8F5] p-5 sm:p-7 rounded-3xl border border-[#E9E4DB] shadow-xs">
            
            {/* SECCIÓN 1: MEDIDA DE LA PIEZA (FINAL) */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-[#636E67]">
                  Medida de la pieza (final)
                </label>
                <button
                  type="button"
                  onClick={handleSwapPieceDimensions}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F5132] hover:text-[#198754] transition-colors py-1 px-2.5 rounded-lg hover:bg-[#EAE4D8]"
                  title="Invertir Ancho y Alto de la pieza"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Invertir orientación</span>
                </button>
              </div>

              {/* Inputs Ancho x Alto */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      min="0.5"
                      step="0.1"
                      value={pieceWidth}
                      onChange={(e) => setPieceWidth(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#DDD5C7] rounded-2xl py-3.5 px-4 text-xl sm:text-2xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent transition-all shadow-xs"
                      placeholder="Ancho"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 mt-1.5 block pl-1">
                    Ancho (cm)
                  </span>
                </div>

                <span className="text-xl font-bold text-[#8A968E] self-center pb-5">×</span>

                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      min="0.5"
                      step="0.1"
                      value={pieceHeight}
                      onChange={(e) => setPieceHeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#DDD5C7] rounded-2xl py-3.5 px-4 text-xl sm:text-2xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent transition-all shadow-xs"
                      placeholder="Alto"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 mt-1.5 block pl-1">
                    Alto (cm)
                  </span>
                </div>
              </div>

              {/* Presets de Piezas (Pills) */}
              <div className="flex flex-wrap gap-2">
                {PIECE_PRESETS.map((preset) => {
                  const isSelected = pieceWidth === preset.w && pieceHeight === preset.h;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setPieceWidth(preset.w);
                        setPieceHeight(preset.h);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#0F5132] text-white shadow-xs scale-[1.02]'
                          : 'bg-white text-slate-700 border border-[#DDD5C7] hover:border-[#0F5132] hover:bg-[#F2EFE9]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN 2: MEDIDA DEL PLIEGO */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-[#636E67]">
                  Medida del pliego
                </label>
                <button
                  type="button"
                  onClick={handleSwapSheetDimensions}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F5132] hover:text-[#198754] transition-colors py-1 px-2.5 rounded-lg hover:bg-[#EAE4D8]"
                  title="Invertir Ancho y Alto del pliego"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Invertir pliego</span>
                </button>
              </div>

              {/* Inputs Ancho x Alto */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      step="0.5"
                      value={sheetWidth}
                      onChange={(e) => setSheetWidth(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#DDD5C7] rounded-2xl py-3.5 px-4 text-xl sm:text-2xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent transition-all shadow-xs"
                      placeholder="Ancho"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 mt-1.5 block pl-1">
                    Ancho (cm)
                  </span>
                </div>

                <span className="text-xl font-bold text-[#8A968E] self-center pb-5">×</span>

                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      step="0.5"
                      value={sheetHeight}
                      onChange={(e) => setSheetHeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#DDD5C7] rounded-2xl py-3.5 px-4 text-xl sm:text-2xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent transition-all shadow-xs"
                      placeholder="Alto"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 mt-1.5 block pl-1">
                    Alto (cm)
                  </span>
                </div>
              </div>

              {/* Presets de Pliego (Pills) */}
              <div className="flex flex-wrap gap-2">
                {SHEET_PRESETS.map((preset) => {
                  const isSelected = sheetWidth === preset.w && sheetHeight === preset.h;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setSheetWidth(preset.w);
                        setSheetHeight(preset.h);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#0F5132] text-white shadow-xs scale-[1.02]'
                          : 'bg-white text-slate-700 border border-[#DDD5C7] hover:border-[#0F5132] hover:bg-[#F2EFE9]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN 3: AJUSTES TÉCNICOS (COLAPSABLE) */}
            <div className="pt-4 border-t border-[#E5DFD4]">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#49544D] hover:text-[#0F5132] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#198754]" />
                  Ajustes técnicos de taller (Pinza y Sangría)
                </span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[#E0D9CC]">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                      Pinza de agarre (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={gripperCm}
                      onChange={(e) => setGripperCm(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl py-2 px-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F5132]"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Espacio no imprimible para los mordedores de la máquina.
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                      Sangría por lado (cm)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="2"
                      value={bleedCm}
                      onChange={(e) => setBleedCm(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl py-2 px-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F5132]"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Rebbase exterior por cada borde para corte en guillotina (0.3 cm = 3 mm).
                    </span>
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                      Ubicación de pinza en pliego:
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setGripperPosition('height')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          gripperPosition === 'height'
                            ? 'bg-[#0F5132] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        En la Altura ({calculation.sh} cm)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGripperPosition('width')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          gripperPosition === 'width'
                            ? 'bg-[#0F5132] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        En el Ancho ({calculation.sw} cm)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SIMULADOR DE TIRAJES / PLIEGOS REQUERIDOS */}
          <div className="bg-white p-5 rounded-3xl border border-[#DEE4DF] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Simulador de Tiraje
              </span>
              <span className="text-xs font-semibold text-[#198754] bg-[#EAF7EE] px-2.5 py-0.5 rounded-full">
                Cálculo en vivo
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/2">
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Cantidad de piezas a producir:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="100"
                    value={targetRunQuantity}
                    onChange={(e) => setTargetRunQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#F8FAF8] border border-[#DEE4DF] rounded-xl py-2 px-3 text-base font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                    piezas
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-1/2 bg-[#F3F7F4] p-3 rounded-2xl border border-[#DEE6E0] flex flex-col justify-center">
                <div className="text-[11px] text-slate-500 font-semibold">
                  Pliegos totales de papel:
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#0F5132]">
                    {calculation.totalSheetsWithWaste.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-600">pliegos</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  ({calculation.sheetsNeededNet.toLocaleString()} netos + {calculation.wasteSheets} de merma/ajuste)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* COLUMNA DERECHA: RESULTADO & DIAGRAMA DE IMPOSICIÓN (TARJETA OSCURA) */}
        {/* ================================================================= */}
        <div className="lg:col-span-6">
          <div className="bg-[#14231A] text-white rounded-3xl p-6 sm:p-8 border border-[#233D2D] shadow-xl flex flex-col">
            
            {/* Cabecera del Resultado: Gran Número */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E3627] text-[#55E6A5] text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Acomodo Óptimo
              </div>
              <div className="text-6xl sm:text-7xl font-black text-[#20C997] tracking-tight font-mono">
                {calculation.activeTotal}
              </div>
              <div className="text-sm sm:text-base font-semibold text-[#8DA695] mt-1">
                piezas por pliego
              </div>
            </div>

            {/* Selector de Orientación de Acomodo */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                type="button"
                onClick={() => setSelectedOrientationMode('auto')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedOrientationMode === 'auto'
                    ? 'bg-[#20C997] text-[#0D1E14] shadow-sm'
                    : 'bg-[#1D3224] text-[#A6C0AF] hover:bg-[#253E2E]'
                }`}
              >
                Auto (Mejor: {calculation.bestIsNormal ? 'Normal' : 'Girada'})
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrientationMode('normal')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedOrientationMode === 'normal'
                    ? 'bg-[#20C997] text-[#0D1E14] shadow-sm'
                    : 'bg-[#1D3224] text-[#A6C0AF] hover:bg-[#253E2E]'
                }`}
              >
                Normal ({calculation.normal.total})
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrientationMode('rotated')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedOrientationMode === 'rotated'
                    ? 'bg-[#20C997] text-[#0D1E14] shadow-sm'
                    : 'bg-[#1D3224] text-[#A6C0AF] hover:bg-[#253E2E]'
                }`}
              >
                Girada 90° ({calculation.rotated.total})
              </button>
            </div>

            {/* DIAGRAMA VECTORIAL SVG DEL PLIEGO Y LAS PIEZAS */}
            <div className="relative w-full bg-[#0D1711] rounded-2xl p-4 sm:p-6 border border-[#233A2C] mb-6 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
              
              {/* Cotas y Dimensiones del Pliego en el Diagrama */}
              <div className="w-full flex items-center justify-between text-[11px] font-mono text-[#789682] mb-2 px-1">
                <span>Ancho: {calculation.sw} cm</span>
                <span>Alto: {calculation.sh} cm</span>
              </div>

              {/* Contenedor del Pliego Proporcional */}
              <div className="w-full flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${calculation.sw} ${calculation.sh}`}
                  className="w-full max-h-[360px] object-contain drop-shadow-md transition-all duration-300"
                  style={{
                    maxHeight: '340px',
                    aspectRatio: `${calculation.sw} / ${calculation.sh}`
                  }}
                >
                  {/* Fondo del Pliego de Papel */}
                  <rect
                    x="0"
                    y="0"
                    width={calculation.sw}
                    height={calculation.sh}
                    fill="#15261C"
                    stroke="#2D4D3A"
                    strokeWidth="0.4"
                    rx="0.5"
                  />

                  {/* Franja de Pinza Reservada */}
                  {calculation.grip > 0 && (
                    <g>
                      {gripperPosition === 'height' ? (
                        <rect
                          x="0"
                          y={calculation.sh - calculation.grip}
                          width={calculation.sw}
                          height={calculation.grip}
                          fill="#D9531E"
                          fillOpacity="0.25"
                          stroke="#D9531E"
                          strokeWidth="0.2"
                          strokeDasharray="1 1"
                        />
                      ) : (
                        <rect
                          x={calculation.sw - calculation.grip}
                          y="0"
                          width={calculation.grip}
                          height={calculation.sh}
                          fill="#D9531E"
                          fillOpacity="0.25"
                          stroke="#D9531E"
                          strokeWidth="0.2"
                          strokeDasharray="1 1"
                        />
                      )}
                    </g>
                  )}

                  {/* Matriz de Piezas Impuestas */}
                  {Array.from({ length: calculation.activeRows }).map((_, rIdx) => {
                    return Array.from({ length: calculation.activeCols }).map((_, cIdx) => {
                      const pieceIdx = rIdx * calculation.activeCols + cIdx + 1;
                      const x = cIdx * calculation.activePieceRenderW;
                      const y = rIdx * calculation.activePieceRenderH;
                      const w = calculation.activePieceRenderW;
                      const h = calculation.activePieceRenderH;

                      return (
                        <g key={`${rIdx}-${cIdx}`} className="group cursor-pointer">
                          {/* Contorno / Bleed de la pieza */}
                          <rect
                            x={x + 0.08}
                            y={y + 0.08}
                            width={w - 0.16}
                            height={h - 0.16}
                            fill="#20C997"
                            fillOpacity="0.85"
                            stroke="#132E20"
                            strokeWidth="0.2"
                            rx="0.2"
                          />
                          {/* Líneas guía internas para visualización detallada si el número de piezas es razonable */}
                          {calculation.activeTotal <= 60 && (
                            <text
                              x={x + w / 2}
                              y={y + h / 2}
                              fontSize={Math.min(w, h) * 0.35}
                              fill="#082115"
                              textAnchor="middle"
                              dominantBaseline="central"
                              fontWeight="bold"
                              fontFamily="monospace"
                              opacity="0.8"
                            >
                              {pieceIdx}
                            </text>
                          )}
                        </g>
                      );
                    });
                  })}
                </svg>
              </div>

              {/* Leyenda de la Pinza */}
              {calculation.grip > 0 && (
                <div className="flex items-center gap-2 mt-3 text-[11px] text-[#A6C0AF]">
                  <span className="w-3 h-2 rounded-xs bg-[#D9531E]/40 border border-[#D9531E]"></span>
                  <span>
                    Borde de pinza reservado ({calculation.grip} cm) en {gripperPosition === 'height' ? 'base de altura' : 'lateral de ancho'}
                  </span>
                </div>
              )}
            </div>

            {/* Badges de Datos Resumen: Acomodo y Orientación */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#1C3224] p-3.5 rounded-2xl border border-[#274532]">
                <span className="text-[10px] font-bold text-[#8FAEA0] uppercase tracking-wider block mb-1">
                  Acomodo
                </span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono">
                  {calculation.activeCols} × {calculation.activeRows}
                </span>
              </div>

              <div className="bg-[#1C3224] p-3.5 rounded-2xl border border-[#274532]">
                <span className="text-[10px] font-bold text-[#8FAEA0] uppercase tracking-wider block mb-1">
                  Orientación
                </span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  {calculation.activeOrientationName}
                </span>
              </div>
            </div>

            {/* Barra de Aprovechamiento de Papel (Como en la Imagen 2) */}
            <div className="bg-[#1C3224] p-4 rounded-2xl border border-[#274532] mb-5">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-[#A2C4B1] uppercase tracking-wide">
                  Aprovechamiento de Papel
                </span>
                <span className="text-[#20C997] font-mono text-sm">
                  {calculation.utilizationPercent}%
                </span>
              </div>
              <div className="w-full bg-[#0E1A13] h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#20C997] h-full rounded-full transition-all duration-500"
                  style={{ width: `${calculation.utilizationPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-[#7B9986] mt-1.5">
                <span>Área útil neta: {Math.round(calculation.netPieceAreaCm2)} cm²</span>
                <span>Pliego total: {Math.round(calculation.totalSheetAreaCm2)} cm²</span>
              </div>
            </div>

            {/* Nota Técnica Requerida (Sin ningún texto de Printara) */}
            <div className="text-[12px] text-[#8DA695] leading-relaxed mb-6 pt-3 border-t border-[#233A2C]">
              Se reservan <strong className="text-white font-semibold">1 cm de pinza</strong> al frente del pliego y <strong className="text-white font-semibold">0.3 cm de sangría</strong> por lado de cada pieza.
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCopySummary}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#1C3224] hover:bg-[#254130] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-[#2B4B36] transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-[#20C997]" /> : <Copy className="w-4 h-4 text-[#A2C4B1]" />}
                <span>{copied ? 'Copiado' : 'Copiar especificación'}</span>
              </button>

              {onApplyToQuote && (
                <button
                  type="button"
                  onClick={() => {
                    onApplyToQuote({
                      pieceWidth: calculation.pw,
                      pieceHeight: calculation.ph,
                      sheetWidth: calculation.sw,
                      sheetHeight: calculation.sh,
                      piecesPerSheet: calculation.activeTotal,
                      layoutDescription: `${calculation.activeCols} × ${calculation.activeRows} (${calculation.activeOrientationName})`,
                    });
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#20C997] hover:bg-[#1BB486] text-[#0D1F15] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Usar en Cotizador</span>
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
