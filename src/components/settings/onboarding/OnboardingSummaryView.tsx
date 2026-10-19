import React, { useState } from 'react';
import { OnboardingFullConfig, CompanySettings } from '../../../types';
import { Check, AlertCircle, Printer, Layers, Users, ArrowRight } from 'lucide-react';

export type SummaryEditTarget =
  | 'imprenta'
  | 'trabajos'
  | 'prensas'
  | 'sustratos'
  | 'produccion';

interface OnboardingSummaryViewProps {
  config: OnboardingFullConfig;
  clientsCount?: number;
  onEditSection: (target: SummaryEditTarget) => void;
  onUpdateCompany?: (updated: Partial<CompanySettings>) => void;
  onFinalize: () => void;
  onGoToQuote?: () => void;
  onGoToClients?: () => void;
}

const WORK_TYPE_LABELS: Record<string, string> = {
  general: 'General',
  editorial: 'Editorial',
  empaque: 'Empaque',
  gran_formato: 'Gran Formato',
};

export const OnboardingSummaryView: React.FC<OnboardingSummaryViewProps> = ({
  config,
  clientsCount = 0,
  onEditSection,
  onUpdateCompany,
  onFinalize,
  onGoToQuote,
  onGoToClients,
}) => {
  const [openSections, setOpenSections] = useState<Record<SummaryEditTarget, boolean>>({
    imprenta: true,
    trabajos: true,
    prensas: true,
    sustratos: true,
    produccion: true,
  });

  const [showPromoCode, setShowPromoCode] = useState(Boolean(config.company.referral_code));
  const [promoCode, setPromoCode] = useState(config.company.referral_code || '');
  const [promoSaved, setPromoSaved] = useState(false);

  // Modal "¡Todo listo para cotizar!" (Imagen 2)
  const [isReadyModalOpen, setIsReadyModalOpen] = useState(false);
  const [showMissingAlert, setShowMissingAlert] = useState(false);

  const toggleSection = (key: SummaryEditTarget) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const configuredPapers = (config.papers || []).filter(
    (p) => p.grammages && p.grammages.length > 0
  );

  const hasMachines = Boolean(config.machines && config.machines.length > 0);
  const hasSubstrates = configuredPapers.length > 0;
  const hasClients = clientsCount > 0;
  const canQuote = hasMachines && hasSubstrates && hasClients;

  const pressCutPercent =
    config.company.press_cut_percent ?? config.company.waste_margin_percent ?? 5;
  const finalCutPrice =
    config.company.final_cut_price !== undefined && config.company.final_cut_price > 0
      ? config.company.final_cut_price
      : 0.5;

  const formatCity = (city?: string) => {
    if (!city) return '—';
    return city.charAt(0).toUpperCase() + city.slice(1);
  };

  const handleApplyPromo = () => {
    if (onUpdateCompany) {
      onUpdateCompany({ referral_code: promoCode.trim() });
    }
    setPromoSaved(true);
    setTimeout(() => setPromoSaved(false), 2000);
  };

  const handleFinalizeClick = () => {
    onFinalize();
    setShowMissingAlert(false);
    setIsReadyModalOpen(true);
  };

  const handleStartFirstQuote = () => {
    if (!canQuote) {
      setShowMissingAlert(true);
      return;
    }
    setIsReadyModalOpen(false);
    if (onGoToQuote) {
      onGoToQuote();
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl px-5 sm:px-10 py-8 sm:py-10 border border-[#E4EAE5] shadow-sm flex flex-col items-center font-sans">
        {/* Ilustración Superior adaptada a los colores de la App */}
        <div className="w-56 sm:w-64 mb-4 select-none flex justify-center">
          <svg
            viewBox="0 0 260 175"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            {/* Sombra elíptica inferior */}
            <ellipse cx="130" cy="164" rx="86" ry="6" fill="#E4EAE5" />

            {/* Destellos y puntos decorativos */}
            <path
              d="M84 18L85.5 23.5L91 25L85.5 26.5L84 32L82.5 26.5L77 25L82.5 23.5L84 18Z"
              fill="#198754"
            />
            <circle cx="145" cy="18" r="2" fill="#198754" opacity="0.5" />
            <circle cx="52" cy="82" r="2" fill="#198754" opacity="0.5" />
            <circle cx="218" cy="70" r="2" fill="#198754" />
            <path
              d="M212 50L213 53L216 54L213 55L212 58L211 55L208 54L211 53L212 50Z"
              fill="#198754"
            />

            {/* Tarjeta Izquierda (Cuadrícula 2x2) */}
            <rect
              x="56"
              y="48"
              width="48"
              height="48"
              rx="6"
              fill="#F8FAF8"
              stroke="#DEE4DF"
              strokeWidth="1.5"
            />
            <rect x="62" y="54" width="16" height="16" rx="2.5" fill="#198754" />
            <rect x="82" y="54" width="16" height="16" rx="2.5" fill="#D1E7DD" />
            <rect x="62" y="74" width="16" height="16" rx="2.5" fill="#D1E7DD" />
            <rect x="82" y="74" width="16" height="16" rx="2.5" fill="#A3CFBB" />

            {/* Tarjeta Central (Cuadrícula 3x3) */}
            <rect
              x="100"
              y="26"
              width="60"
              height="62"
              rx="7"
              fill="#F8FAF8"
              stroke="#DEE4DF"
              strokeWidth="1.5"
            />
            <rect x="107" y="33" width="22" height="11" rx="2" fill="#198754" />
            <rect x="133" y="33" width="20" height="11" rx="2" fill="#D1E7DD" />
            <rect x="107" y="48" width="13" height="14" rx="2" fill="#A3CFBB" />
            <rect x="123.5" y="48" width="13" height="14" rx="2" fill="#A3CFBB" />
            <rect x="140" y="48" width="13" height="14" rx="2" fill="#D1E7DD" />
            <rect x="107" y="66" width="13" height="14" rx="2" fill="#D1E7DD" />
            <rect x="123.5" y="66" width="13" height="14" rx="2" fill="#A3CFBB" />
            <rect x="140" y="66" width="13" height="14" rx="2" fill="#D1E7DD" />

            {/* Tarjeta Derecha (Panel oscuro + Hoja de líneas) */}
            <rect
              x="155"
              y="38"
              width="52"
              height="56"
              rx="6"
              fill="#F8FAF8"
              stroke="#DEE4DF"
              strokeWidth="1.5"
            />
            <rect x="155" y="38" width="21" height="56" rx="5" fill="#0F5132" />
            <rect x="159" y="45" width="13" height="3" rx="1.5" fill="#198754" />
            <rect x="159" y="51" width="10" height="2.5" rx="1.25" fill="#A3CFBB" />
            <rect x="159" y="56" width="13" height="2.5" rx="1.25" fill="#198754" />
            <rect x="159" y="75" width="9" height="9" rx="2" fill="#146C43" />

            {/* Líneas de texto en tarjeta derecha */}
            <rect x="181" y="46" width="20" height="3" rx="1.5" fill="#CBD5E1" />
            <rect x="181" y="53" width="16" height="3" rx="1.5" fill="#CBD5E1" />
            <rect x="181" y="60" width="20" height="3" rx="1.5" fill="#CBD5E1" />
            <rect x="181" y="67" width="18" height="3" rx="1.5" fill="#CBD5E1" />
            <rect x="181" y="74" width="13" height="3" rx="1.5" fill="#CBD5E1" />
            <rect x="181" y="81" width="17" height="3" rx="1.5" fill="#CBD5E1" />

            {/* Círculo Verde de Checkmark Superior Derecho */}
            <circle cx="177" cy="24" r="16" fill="#198754" />
            <path
              d="M170 24.5L174.8 29L184.5 19.5"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Base Inferior de la Prensa / Consola */}
            <rect x="66" y="96" width="128" height="32" rx="6" fill="#0F5132" />
            <rect x="66" y="122" width="128" height="38" rx="6" fill="#0A3622" />
            {/* Barra verde en consola */}
            <rect x="102" y="103" width="56" height="7" rx="3.5" fill="#198754" />

            {/* Panel izquierdo inferior */}
            <rect x="74" y="130" width="34" height="22" rx="4" fill="#0F5132" />
            <rect x="79" y="135" width="24" height="2.5" rx="1.25" fill="#198754" />
            <rect x="79" y="140" width="18" height="2.5" rx="1.25" fill="#146C43" />
            <rect x="79" y="145" width="21" height="2.5" rx="1.25" fill="#146C43" />

            {/* Ranura central inferior */}
            <rect x="114" y="134" width="46" height="13" rx="3" fill="#0F5132" />
            <rect x="119" y="138" width="36" height="2" rx="1" fill="#198754" />
            <rect x="119" y="142" width="26" height="2" rx="1" fill="#198754" />

            {/* Indicadores circulares derechos */}
            <circle cx="163" cy="117" r="6" fill="#198754" />
            <circle cx="176" cy="117" r="4" fill="#146C43" />
            <circle cx="186" cy="117" r="4" fill="#146C43" />
            <circle cx="172" cy="141" r="3" fill="#146C43" />
            <circle cx="182" cy="141" r="3" fill="#146C43" />
          </svg>
        </div>

        {/* Título Principal y Subtítulo con Fuentes y Colores de la App */}
        <h1 className="text-2xl sm:text-[28px] font-bold font-heading text-slate-900 text-center tracking-tight leading-tight">
          ¡{config.company.company_name || 'editorial jimenez'} está lista!
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-500 text-center font-medium mt-2 mb-7">
          Revisa tu configuración — puedes editar cualquier sección antes de guardar.
        </p>

        {/* Contenedor de las 5 Secciones */}
        <div className="w-full flex flex-col gap-3.5">
          {/* 1. TU IMPRENTA */}
          <div className="w-full bg-[#EFF5F0]/70 border border-[#DEE4DF] rounded-xl overflow-hidden">
            <div
              onClick={() => toggleSection('imprenta')}
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none"
            >
              <span className="text-[13px] sm:text-sm font-bold text-slate-900 font-heading">
                Tu imprenta
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSection('imprenta');
                  }}
                  className="px-3.5 py-1 rounded-lg border border-[#198754]/40 bg-[#E8F5E9] hover:bg-[#D1E7DD] text-[#0F5132] text-xs font-bold transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <span
                  className={`text-[10px] text-slate-500 transition-transform duration-200 ${
                    openSections.imprenta ? 'rotate-0' : '-rotate-90'
                  }`}
                >
                  ▾
                </span>
              </div>
            </div>

            {openSections.imprenta && (
              <div className="px-5 pb-3 pt-0.5 flex flex-col">
                <div className="flex items-center justify-between py-2 border-b border-[#DEE4DF] text-xs sm:text-[13px]">
                  <span className="text-slate-500">Nombre</span>
                  <span className="text-slate-900 font-semibold text-right">
                    {config.company.contact_name || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#DEE4DF] text-xs sm:text-[13px]">
                  <span className="text-slate-500">Imprenta</span>
                  <span className="text-slate-900 font-semibold text-right">
                    {config.company.company_name || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#DEE4DF] text-xs sm:text-[13px]">
                  <span className="text-slate-500">Ciudad</span>
                  <span className="text-slate-900 font-semibold text-right">
                    {formatCity(config.company.city)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#DEE4DF] text-xs sm:text-[13px]">
                  <span className="text-slate-500">Teléfono</span>
                  <span className="text-slate-900 font-semibold text-right">
                    {config.company.phone || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#DEE4DF] text-xs sm:text-[13px]">
                  <span className="text-slate-500">Correo</span>
                  <span className="text-slate-900 font-semibold text-right">
                    {config.company.email || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 text-xs sm:text-[13px]">
                  <span className="text-slate-500">Logo</span>
                  <span className="text-slate-900 font-semibold text-right">
                    {config.company.logo_url ? 'Cargado' : 'No cargado'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. TIPO DE TRABAJOS */}
          <div className="w-full bg-[#EFF5F0]/70 border border-[#DEE4DF] rounded-xl overflow-hidden">
            <div
              onClick={() => toggleSection('trabajos')}
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none"
            >
              <span className="text-[13px] sm:text-sm font-bold text-slate-900 font-heading">
                Tipo de trabajos
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSection('trabajos');
                  }}
                  className="px-3.5 py-1 rounded-lg border border-[#198754]/40 bg-[#E8F5E9] hover:bg-[#D1E7DD] text-[#0F5132] text-xs font-bold transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <span
                  className={`text-[10px] text-slate-500 transition-transform duration-200 ${
                    openSections.trabajos ? 'rotate-0' : '-rotate-90'
                  }`}
                >
                  ▾
                </span>
              </div>
            </div>

            {openSections.trabajos && (
              <div className="px-5 pb-4 pt-1 flex flex-wrap gap-2">
                {(config.company.work_types && config.company.work_types.length > 0
                  ? config.company.work_types
                  : ['general']
                ).map((type) => (
                  <span
                    key={type}
                    className="px-3.5 py-1 rounded-full border border-[#198754]/40 bg-[#E8F5E9] text-[#0F5132] text-xs font-bold"
                  >
                    {WORK_TYPE_LABELS[type] || type}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 3. PRENSAS */}
          <div className="w-full bg-[#EFF5F0]/70 border border-[#DEE4DF] rounded-xl overflow-hidden">
            <div
              onClick={() => toggleSection('prensas')}
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none"
            >
              <span className="text-[13px] sm:text-sm font-bold text-slate-900 font-heading">
                Prensas
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSection('prensas');
                  }}
                  className="px-3.5 py-1 rounded-lg border border-[#198754]/40 bg-[#E8F5E9] hover:bg-[#D1E7DD] text-[#0F5132] text-xs font-bold transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <span
                  className={`text-[10px] text-slate-500 transition-transform duration-200 ${
                    openSections.prensas ? 'rotate-0' : '-rotate-90'
                  }`}
                >
                  ▾
                </span>
              </div>
            </div>

            {openSections.prensas && (
              <div className="px-5 pb-4 pt-1">
                {!config.machines || config.machines.length === 0 ? (
                  <p className="text-xs sm:text-[13px] italic text-slate-500">
                    No se agregaron máquinas
                  </p>
                ) : (
                  <div className="flex flex-col">
                    {config.machines.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between py-2 border-b border-[#DEE4DF] last:border-b-0 text-xs sm:text-[13px]"
                      >
                        <span className="text-slate-900 font-semibold">
                          {m.name}{' '}
                          <span className="text-slate-500 font-normal">
                            ({m.sheet_size})
                          </span>
                        </span>
                        <span className="text-slate-900 font-semibold text-right">
                          Lám ${m.plate_price ?? 80} · ${m.print_price ?? 80}/mil
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. SUSTRATOS Y GRAMAJES */}
          <div className="w-full bg-[#EFF5F0]/70 border border-[#DEE4DF] rounded-xl overflow-hidden">
            <div
              onClick={() => toggleSection('sustratos')}
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none"
            >
              <span className="text-[13px] sm:text-sm font-bold text-slate-900 font-heading">
                Sustratos y gramajes
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSection('sustratos');
                  }}
                  className="px-3.5 py-1 rounded-lg border border-[#198754]/40 bg-[#E8F5E9] hover:bg-[#D1E7DD] text-[#0F5132] text-xs font-bold transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <span
                  className={`text-[10px] text-slate-500 transition-transform duration-200 ${
                    openSections.sustratos ? 'rotate-0' : '-rotate-90'
                  }`}
                >
                  ▾
                </span>
              </div>
            </div>

            {openSections.sustratos && (
              <div className="px-5 pb-4 pt-1">
                {configuredPapers.length === 0 ? (
                  <p className="text-xs sm:text-[13px] italic text-slate-500">
                    No se configuraron sustratos
                  </p>
                ) : (
                  <div className="flex flex-col">
                    {configuredPapers.map((paper) => (
                      <div
                        key={paper.id}
                        className="flex items-center justify-between py-2 border-b border-[#DEE4DF] last:border-b-0 text-xs sm:text-[13px]"
                      >
                        <span className="text-slate-500">{paper.name}</span>
                        <span className="text-slate-900 font-semibold text-right">
                          {paper.grammages
                            .map((g) => `${g.grammage}g ($${g.price_per_thousand})`)
                            .join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. PRODUCCIÓN Y PRECIOS */}
          <div className="w-full bg-[#EFF5F0]/70 border border-[#DEE4DF] rounded-xl overflow-hidden">
            <div
              onClick={() => toggleSection('produccion')}
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none"
            >
              <span className="text-[13px] sm:text-sm font-bold text-slate-900 font-heading">
                Producción y precios
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSection('produccion');
                  }}
                  className="px-3.5 py-1 rounded-lg border border-[#198754]/40 bg-[#E8F5E9] hover:bg-[#D1E7DD] text-[#0F5132] text-xs font-bold transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <span
                  className={`text-[10px] text-slate-500 transition-transform duration-200 ${
                    openSections.produccion ? 'rotate-0' : '-rotate-90'
                  }`}
                >
                  ▾
                </span>
              </div>
            </div>

            {openSections.produccion && (
              <div className="px-5 pb-3 pt-1 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  GENERAL
                </span>
                <div className="flex items-center justify-between py-2 border-b border-[#DEE4DF] text-xs sm:text-[13px]">
                  <span className="text-slate-500">Corte a prensa</span>
                  <span className="text-slate-900 font-semibold text-right">
                    {pressCutPercent}% sobre papel
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 text-xs sm:text-[13px]">
                  <span className="text-slate-500">Corte final</span>
                  <span className="text-slate-900 font-semibold text-right">
                    ${finalCutPrice} por corte
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Código Promocional Opcional */}
        <div className="w-full mt-5 mb-6 flex flex-col items-start gap-2.5">
          <button
            type="button"
            onClick={() => setShowPromoCode((prev) => !prev)}
            className="inline-flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-xs font-bold text-[#198754] underline decoration-[#198754] underline-offset-2 group-hover:text-[#0F5132]">
              ¿Tienes un código promocional?
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 border border-[#DEE4DF] bg-[#EFF5F0] px-1.5 py-0.5 rounded underline decoration-slate-400">
              OPCIONAL
            </span>
          </button>

          {showPromoCode && (
            <div className="w-full sm:max-w-xs flex items-center gap-2 animate-in fade-in duration-150">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Ingresa tu código"
                className="flex-1 px-3 py-2 bg-[#F8FAF8] border border-[#DEE4DF] rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#198754]"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-3.5 py-2 rounded-xl bg-[#0F5132] hover:bg-[#198754] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                {promoSaved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{promoSaved ? 'Aplicado' : 'Aplicar'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Botón Principal: Finalizar configuración */}
        <button
          type="button"
          onClick={handleFinalizeClick}
          className="w-full py-4 rounded-xl bg-[#198754] hover:bg-[#0F5132] text-white font-bold text-sm sm:text-[15px] shadow-md transition-all cursor-pointer active:scale-[0.99]"
        >
          Finalizar configuración
        </button>
      </div>

      {/* Modal "¡Todo listo para cotizar!" (Imagen 2 adaptada a los colores y fuentes de la app) */}
      {isReadyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-7 sm:p-9 max-w-md w-full border border-[#E4EAE5] shadow-2xl flex flex-col items-center text-center">
            {/* Ilustración de Documento con Check Verde (Exacta a Imagen 2 con colores de la App) */}
            <div className="w-36 h-32 mb-3 select-none flex items-center justify-center">
              <svg
                viewBox="0 0 160 135"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                {/* Sombra inferior */}
                <ellipse cx="78" cy="124" rx="46" ry="5" fill="#E4EAE5" />

                {/* Destellos decorativos */}
                <path
                  d="M42 15L43 18.5L46.5 19.5L43 20.5L42 24L41 20.5L37.5 19.5L41 18.5L42 15Z"
                  fill="#198754"
                />
                <path
                  d="M35 66L35.8 68.5L38.3 69.3L35.8 70.1L35 72.6L34.2 70.1L31.7 69.3L34.2 68.5L35 66Z"
                  fill="#198754"
                  opacity="0.7"
                />
                <circle cx="122" cy="60" r="3" fill="#198754" opacity="0.55" />
                <circle cx="112" cy="70" r="2" fill="#198754" opacity="0.4" />

                {/* Hoja de documento de fondo (sombra desplazada) */}
                <rect
                  x="40"
                  y="20"
                  width="66"
                  height="88"
                  rx="8"
                  fill="#EFF5F0"
                />

                {/* Hoja principal */}
                <rect
                  x="45"
                  y="14"
                  width="68"
                  height="90"
                  rx="8"
                  fill="#F8FAF8"
                  stroke="#DEE4DF"
                  strokeWidth="1.5"
                />

                {/* Encabezado verde suave de la hoja */}
                <path
                  d="M45.75 22C45.75 17.9959 48.9959 14.75 53 14.75H105C109.004 14.75 112.25 17.9959 112.25 22V30H45.75V22Z"
                  fill="#D1E7DD"
                />

                {/* Líneas del documento */}
                <rect x="54" y="40" width="44" height="4" rx="2" fill="#CBD5E1" />
                <rect x="54" y="49" width="36" height="4" rx="2" fill="#CBD5E1" />
                <rect x="54" y="58" width="46" height="4" rx="2" fill="#CBD5E1" />
                <rect x="54" y="67" width="40" height="4" rx="2" fill="#CBD5E1" />

                {/* Recuadro inferior con barras verdes */}
                <rect x="53" y="78" width="42" height="18" rx="4" fill="#E8F5E9" />
                <rect x="57" y="82" width="20" height="3.5" rx="1.75" fill="#198754" />
                <rect x="57" y="88.5" width="32" height="4" rx="2" fill="#0F5132" />

                {/* Círculo Verde con Checkmark */}
                <circle cx="106" cy="27" r="16" fill="#198754" />
                <path
                  d="M99 27.5L103.8 32L113.5 22.5"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Título y Descripción */}
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
              ¡Todo listo para cotizar!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-2.5 max-w-xs">
              Tu imprenta quedó configurada con tus precios y servicios reales. ¿Hacemos tu primera cotización ahora?
            </p>

            {/* Validación de Requisitos Obligatorios para Cotizar (Máquinas, Sustratos/Gramajes y Clientes) */}
            {showMissingAlert && !canQuote && (
              <div className="w-full mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left flex flex-col gap-2.5 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-[#D9531E] shrink-0" />
                  <span>Para poder cotizar necesitas tener configurado:</span>
                </div>

                <div className="flex flex-col gap-2">
                  {/* Requisito 1: Máquina */}
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-200/80 text-xs">
                    <span className="flex items-center gap-2 font-semibold text-slate-800">
                      <Printer className="w-3.5 h-3.5 text-[#0F5132]" />
                      1. Máquina configurada
                    </span>
                    {hasMachines ? (
                      <span className="text-[#198754] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Lista
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsReadyModalOpen(false);
                          onEditSection('prensas');
                        }}
                        className="text-[#D9531E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Configurar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Requisito 2: Sustratos y Gramajes */}
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-200/80 text-xs">
                    <span className="flex items-center gap-2 font-semibold text-slate-800">
                      <Layers className="w-3.5 h-3.5 text-[#0F5132]" />
                      2. Sustratos y gramajes
                    </span>
                    {hasSubstrates ? (
                      <span className="text-[#198754] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Listos
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsReadyModalOpen(false);
                          onEditSection('sustratos');
                        }}
                        className="text-[#D9531E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Configurar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Requisito 3: Clientes */}
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-200/80 text-xs">
                    <span className="flex items-center gap-2 font-semibold text-slate-800">
                      <Users className="w-3.5 h-3.5 text-[#0F5132]" />
                      3. Clientes registrados
                    </span>
                    {hasClients ? (
                      <span className="text-[#198754] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Listos ({clientsCount})
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsReadyModalOpen(false);
                          if (onGoToClients) onGoToClients();
                        }}
                        className="text-[#D9531E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Agregar cliente</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botones de Acción del Modal (Imagen 2) */}
            <div className="flex flex-col gap-3 w-full mt-6">
              <button
                type="button"
                onClick={handleStartFirstQuote}
                className="w-full py-3.5 rounded-xl bg-[#198754] hover:bg-[#0F5132] text-white font-bold text-sm shadow-sm transition-all cursor-pointer active:scale-[0.99]"
              >
                Hacer mi primera cotización
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsReadyModalOpen(false);
                  setShowMissingAlert(false);
                }}
                className="w-full py-3.5 rounded-xl bg-[#F8FAF8] hover:bg-[#EFF5F0] border border-[#DEE4DF] text-slate-700 font-bold text-sm transition-all cursor-pointer"
              >
                Regresar a revisar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
