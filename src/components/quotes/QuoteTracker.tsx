import React, { useState, useEffect } from 'react';
import { Quote, QuoteStatus } from '../../types';
import { quoteService } from '../../services/quoteService';
import { 
  CheckSquare, 
  Search, 
  Plus, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Send, 
  XCircle, 
  Building2, 
  FileText,
  TrendingUp,
  Eye,
  Calendar
} from 'lucide-react';

interface QuoteTrackerProps {
  onSelectQuote: (quote: Quote) => void;
  onNewQuote: () => void;
}

export const QuoteTracker: React.FC<QuoteTrackerProps> = ({ onSelectQuote, onNewQuote }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<QuoteStatus | 'TODOS'>('TODOS');
  const [search, setSearch] = useState('');

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const { data } = await quoteService.getQuotes(filterStatus, search);
      setQuotes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [filterStatus, search]);

  const statuses: (QuoteStatus | 'TODOS')[] = [
    'TODOS',
    'enviada',
    'negociacion',
    'aceptada',
    'rechazada',
    'borrador',
  ];

  const totalAcceptedValue = quotes
    .filter((q) => q.status === 'aceptada')
    .reduce((sum, q) => sum + Number(q.total || 0), 0);

  const totalPipelineValue = quotes
    .filter((q) => q.status === 'enviada' || q.status === 'negociacion')
    .reduce((sum, q) => sum + Number(q.total || 0), 0);

  return (
    <div className="flex flex-col w-full pb-16 gap-6">
      {/* Header Area */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E4EAE5] flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#0F5132] flex items-center justify-center font-bold shadow-sm">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-[#198754] inline-block"></span>
                <h1 className="text-xl sm:text-2xl font-bold text-[#0F5132] font-heading tracking-tight">
                  Seguimiento de Cotizaciones &amp; Pipeline
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Control de estados comerciales, vigencias y proyectos en producción
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por folio, cliente o proyecto..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#EFF5F0] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#D9531E]"
              />
            </div>
            <button
              onClick={onNewQuote}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D9531E] hover:bg-[#C84B15] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Cotización</span>
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                filterStatus === st
                  ? 'bg-[#0F5132] text-white shadow-sm'
                  : 'bg-[#EFF5F0] hover:bg-[#DEE4DF] text-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#EFF5F0] p-4 rounded-xl border border-[#DEE4DF] flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Cotizaciones Registradas
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
              {quotes.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-600 text-xs font-bold">
              En PostgreSQL
            </span>
          </div>
        </div>

        <div className="bg-[#EFF5F0] p-4 rounded-xl border border-[#DEE4DF] flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            En Negociación / Activas
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-heading text-[#D9531E]">
              ${totalPipelineValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
              Pipeline vivo
            </span>
          </div>
        </div>

        <div className="bg-[#EFF5F0] p-4 rounded-xl border border-[#DEE4DF] flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Ganadas / En Producción
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-heading text-[#0F5132]">
              ${totalAcceptedValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#0F5132] text-xs font-bold">
              Aceptadas
            </span>
          </div>
        </div>
      </div>

      {/* Quotes List Table / Cards */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E4EAE5] flex flex-col gap-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Cargando cotizaciones...</div>
        ) : quotes.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No hay cotizaciones con este criterio</p>
            <p className="text-xs mt-1">Crea una nueva cotización con el asistente técnico.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {quotes.map((q) => {
              let statusBadge = 'bg-slate-100 text-slate-700';
              let icon = <Clock className="w-3 h-3" />;
              if (q.status === 'aceptada') {
                statusBadge = 'bg-[#E8F5E9] text-[#198754]';
                icon = <CheckCircle2 className="w-3 h-3" />;
              } else if (q.status === 'enviada') {
                statusBadge = 'bg-blue-50 text-blue-600';
                icon = <Send className="w-3 h-3" />;
              } else if (q.status === 'negociacion') {
                statusBadge = 'bg-amber-50 text-amber-700';
                icon = <Clock className="w-3 h-3" />;
              } else if (q.status === 'rechazada') {
                statusBadge = 'bg-red-50 text-red-600';
                icon = <XCircle className="w-3 h-3" />;
              }

              return (
                <div
                  key={q.id}
                  onClick={() => onSelectQuote(q)}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-[#198754] hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#EFF5F0] text-[#0F5132] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#0F5132] group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#0F5132]">
                          {q.quote_number}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold flex items-center gap-1 ${statusBadge}`}>
                          {icon}
                          <span>{q.status}</span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(q.created_at).toLocaleDateString('es-MX')}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#198754] transition-colors mt-1">
                        {q.project_title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-0.5">
                        Cliente: <strong className="text-slate-800">{q.client?.business_name || 'Sin asignar'}</strong>
                        {q.client?.rfc && ` (${q.client.rfc})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Total con IVA</span>
                      <span className="font-heading font-bold text-base sm:text-lg text-[#0F5132]">
                        ${Number(q.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-[#EFF5F0] group-hover:bg-[#D9531E] group-hover:text-white transition-all text-slate-600">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
