import React, { useState, useEffect, useMemo } from 'react';
import { Client, Quote } from '../../types';
import { clientService } from '../../services/clientService';
import { quoteService } from '../../services/quoteService';
import { 
  FileText, 
  DollarSign, 
  Plus, 
  Clock, 
  User as UserIcon,
  ChevronDown,
  Calendar,
  Receipt
} from 'lucide-react';

interface OverviewDashboardProps {
  onNavigateToQuotes: () => void;
  onNavigateToClients?: () => void;
  onNavigateToConfig?: () => void;
  onNavigateToImposition?: () => void;
  onSelectQuote: (quote: Quote) => void;
}

type StatusFilterType = 'todas' | 'por_cerrar' | 'confirmadas';
type PeriodFilterType = 'hoy' | 'semana' | 'mes' | 'anio' | 'todo' | 'fecha';

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigateToQuotes,
  onSelectQuote,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros de la barra superior (Imagen 3)
  const [selectedClientId, setSelectedClientId] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('todas');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterType>('mes');
  const [customDate, setCustomDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cRes, qRes] = await Promise.all([
          clientService.getClients(),
          quoteService.getQuotes(),
        ]);
        setClients(cRes.data);
        setQuotes(qRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredQuotes = useMemo(() => {
    const now = new Date();
    return quotes.filter((q) => {
      // 1. Filtro por cliente
      if (selectedClientId !== 'todos' && q.client_id !== selectedClientId) {
        return false;
      }

      // 2. Filtro por estado
      if (statusFilter === 'por_cerrar') {
        if (!['borrador', 'enviada', 'negociacion'].includes(q.status)) {
          return false;
        }
      } else if (statusFilter === 'confirmadas') {
        if (q.status !== 'aceptada') {
          return false;
        }
      }

      // 3. Filtro por período
      if (periodFilter !== 'todo') {
        const qDate = new Date(q.created_at);
        if (!isNaN(qDate.getTime())) {
          if (periodFilter === 'hoy') {
            if (
              qDate.getFullYear() !== now.getFullYear() ||
              qDate.getMonth() !== now.getMonth() ||
              qDate.getDate() !== now.getDate()
            ) {
              return false;
            }
          } else if (periodFilter === 'semana') {
            const diffDays = (now.getTime() - qDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays > 7 || diffDays < -1) {
              return false;
            }
          } else if (periodFilter === 'mes') {
            if (
              qDate.getFullYear() !== now.getFullYear() ||
              qDate.getMonth() !== now.getMonth()
            ) {
              return false;
            }
          } else if (periodFilter === 'anio') {
            if (qDate.getFullYear() !== now.getFullYear()) {
              return false;
            }
          } else if (periodFilter === 'fecha' && customDate) {
            const qDateStr = q.created_at.slice(0, 10);
            if (qDateStr !== customDate) {
              return false;
            }
          }
        }
      }

      return true;
    });
  }, [quotes, selectedClientId, statusFilter, periodFilter, customDate]);

  const montoCotizado = useMemo(
    () => filteredQuotes.reduce((acc, q) => acc + Number(q.total || 0), 0),
    [filteredQuotes]
  );

  const totalCotizaciones = filteredQuotes.length;

  const ticketPromedio = useMemo(
    () => (totalCotizaciones > 0 ? montoCotizado / totalCotizaciones : 0),
    [montoCotizado, totalCotizaciones]
  );

  const porCerrarCount = useMemo(
    () =>
      filteredQuotes.filter((q) =>
        ['borrador', 'enviada', 'negociacion'].includes(q.status)
      ).length,
    [filteredQuotes]
  );

  const formatMoney = (amount: number) =>
    `$${amount.toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="flex flex-col w-full pb-16 gap-5 font-sans">
      {/* Encabezado Superior: Resumen / Resumen del taller */}
      <div className="flex flex-col gap-0.5 pb-3 border-b border-[#DEE4DF]">
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
          Resumen
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
          Resumen del taller
        </p>
      </div>

      {/* Barra de Filtros (Clientes | ESTADO | PERÍODO) */}
      <div className="bg-white rounded-2xl p-3.5 sm:px-5 sm:py-3.5 border border-[#DEE4DF] shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Selector de Clientes */}
        <div className="relative min-w-[200px] sm:min-w-[220px]">
          <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            aria-label="Filtrar por cliente"
            className="w-full pl-9 pr-8 py-2 bg-[#F8FAF8] hover:bg-[#EFF5F0] border border-[#DEE4DF] rounded-xl text-xs sm:text-[13px] font-semibold text-slate-800 appearance-none outline-none focus:border-[#0F5132] transition-colors cursor-pointer"
          >
            <option value="todos">Todos los clientes</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.business_name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="h-6 w-px bg-[#DEE4DF] hidden md:block" />

        {/* Filtro ESTADO */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">
            ESTADO
          </span>
          {(
            [
              { id: 'todas', label: 'Todas' },
              { id: 'por_cerrar', label: 'Por cerrar' },
              { id: 'confirmadas', label: 'Confirmadas' },
            ] as { id: StatusFilterType; label: string }[]
          ).map((item) => {
            const active = statusFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatusFilter(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0F5132] text-white border-[#0F5132] shadow-2xs'
                    : 'bg-[#F8FAF8] hover:bg-[#EFF5F0] text-slate-700 border-[#DEE4DF]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="h-6 w-px bg-[#DEE4DF] hidden xl:block" />

        {/* Filtro PERÍODO */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">
            PERÍODO
          </span>
          {(
            [
              { id: 'hoy', label: 'Hoy' },
              { id: 'semana', label: 'Semana' },
              { id: 'mes', label: 'Mes' },
              { id: 'anio', label: 'Año' },
              { id: 'todo', label: 'Todo' },
            ] as { id: PeriodFilterType; label: string }[]
          ).map((item) => {
            const active = periodFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPeriodFilter(item.id);
                  setShowDatePicker(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0F5132] text-white border-[#0F5132] shadow-2xs'
                    : 'bg-[#F8FAF8] hover:bg-[#EFF5F0] text-slate-700 border-[#DEE4DF]'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Botón de Calendario */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDatePicker((prev) => !prev)}
              title="Filtrar por fecha específica"
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                periodFilter === 'fecha'
                  ? 'bg-[#0F5132] text-white border-[#0F5132]'
                  : 'bg-[#F8FAF8] hover:bg-[#EFF5F0] text-slate-600 border-[#DEE4DF]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 bg-white border border-[#DEE4DF] rounded-xl shadow-lg p-2.5 z-30 flex items-center gap-2">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setPeriodFilter('fecha');
                    setShowDatePicker(false);
                  }}
                  className="px-2.5 py-1.5 border border-[#DEE4DF] rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#198754]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Tarjetas KPI (MONTO COTIZADO | COTIZACIONES | TICKET PROMEDIO | POR CERRAR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. MONTO COTIZADO */}
        <div className="bg-white p-5 rounded-2xl border border-[#DEE4DF] shadow-xs flex flex-col justify-between min-h-[118px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              MONTO COTIZADO
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#D1E7DD] text-[#198754] flex items-center justify-center">
              <DollarSign className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-[#198754] tracking-tight">
              {formatMoney(montoCotizado)}
            </span>
          </div>
        </div>

        {/* 2. COTIZACIONES */}
        <div className="bg-white p-5 rounded-2xl border border-[#DEE4DF] shadow-xs flex flex-col justify-between min-h-[118px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              COTIZACIONES
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EFF5F0] text-slate-600 border border-[#DEE4DF] flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              {totalCotizaciones}
            </span>
          </div>
        </div>

        {/* 3. TICKET PROMEDIO */}
        <div className="bg-white p-5 rounded-2xl border border-[#DEE4DF] shadow-xs flex flex-col justify-between min-h-[118px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TICKET PROMEDIO
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EFF5F0] text-slate-600 border border-[#DEE4DF] flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              {formatMoney(ticketPromedio)}
            </span>
          </div>
        </div>

        {/* 4. POR CERRAR */}
        <div className="bg-white p-5 rounded-2xl border border-[#DEE4DF] shadow-xs flex flex-col justify-between min-h-[118px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              POR CERRAR
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#D9531E] border border-amber-200/70 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              {porCerrarCount}
            </span>
          </div>
        </div>
      </div>

      {/* Barra Intermedia: COTIZACIONES + Botón "+ Nueva cotización" */}
      <div className="bg-white rounded-2xl px-6 py-4 border border-[#DEE4DF] shadow-xs flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-extrabold font-heading uppercase text-slate-900 tracking-tight">
            COTIZACIONES
          </span>
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
            {totalCotizaciones === 0
              ? 'Sin cotizaciones aún'
              : `${totalCotizaciones} ${
                  totalCotizaciones === 1
                    ? 'cotización registrada'
                    : 'cotizaciones registradas'
                }`}
          </span>
        </div>

        <button
          type="button"
          onClick={onNavigateToQuotes}
          className="px-5 py-2.5 rounded-xl bg-[#198754] hover:bg-[#0F5132] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nueva cotización</span>
        </button>
      </div>

      {/* Contenedor Principal de Cotizaciones / Estado Vacío */}
      <div className="bg-white rounded-2xl border border-[#DEE4DF] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-7 h-7 border-3 border-[#198754] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="py-16 sm:py-20 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-11 h-12 rounded-xl border border-[#DEE4DF] bg-[#F8FAF8] text-slate-400 flex items-center justify-center mb-3.5">
              <FileText className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900">
              Sin cotizaciones todavía
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-500 max-w-sm mt-1.5 leading-relaxed">
              Las cotizaciones aparecen aquí al descargar el PDF o enviar por WhatsApp desde el cotizador.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4EAE5]">
            {filteredQuotes.map((q) => (
              <div
                key={q.id}
                onClick={() => onSelectQuote(q)}
                className="px-6 py-4 hover:bg-[#F8FAF8] transition-colors cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0F5132]">
                      {q.quote_number}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        q.status === 'aceptada'
                          ? 'bg-[#E8F5E9] text-[#0F5132] border-[#198754]/30'
                          : q.status === 'rechazada'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#198754] transition-colors">
                    {q.project_title}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {q.client?.business_name || 'Cliente comercial'} ·{' '}
                    {new Date(q.created_at).toLocaleDateString('es-MX')}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-heading font-extrabold text-sm sm:text-base text-[#0F5132]">
                    {formatMoney(Number(q.total || 0))}
                  </span>
                  <span className="block text-[10px] text-slate-400">IVA incluido</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
