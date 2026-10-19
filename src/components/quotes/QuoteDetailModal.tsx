import React, { useState } from 'react';
import { Quote, QuoteStatus } from '../../types';
import { quoteService } from '../../services/quoteService';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Send, 
  XCircle, 
  Building2, 
  Calendar, 
  Receipt,
  FileText,
  DollarSign
} from 'lucide-react';

interface QuoteDetailModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (id: string, newStatus: QuoteStatus) => void;
  onShowNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const QuoteDetailModal: React.FC<QuoteDetailModalProps> = ({
  quote,
  isOpen,
  onClose,
  onStatusUpdated,
  onShowNotification,
}) => {
  const [updating, setUpdating] = useState(false);

  if (!isOpen || !quote) return null;

  const handleStatusChange = async (status: QuoteStatus) => {
    setUpdating(true);
    try {
      const { success, error } = await quoteService.updateQuoteStatus(quote.id, status);
      if (!success) {
        throw new Error(error || 'Error actualizando estatus');
      }
      onStatusUpdated(quote.id, status);
      onShowNotification(`Estatus actualizado a: ${status.toUpperCase()}`, 'success');
    } catch (err: any) {
      onShowNotification(err.message || 'Error al actualizar estatus', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F8FAF8] border-b border-[#E4EAE5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#0F5132] flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#0F5132]">{quote.quote_number}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {quote.status}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-heading truncate max-w-md">
                {quote.project_title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
              title="Imprimir / Exportar a PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Status Changer Bar */}
          <div className="p-3 bg-[#EFF5F0] rounded-xl border border-[#DEE4DF] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#0F5132] uppercase tracking-wider">
              Cambiar Estado de la Cotización:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={updating || quote.status === 'enviada'}
                onClick={() => handleStatusChange('enviada')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  quote.status === 'enviada'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                <Send className="w-3 h-3" />
                <span>Enviada</span>
              </button>

              <button
                disabled={updating || quote.status === 'negociacion'}
                onClick={() => handleStatusChange('negociacion')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  quote.status === 'negociacion'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white hover:bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>En Negociación</span>
              </button>

              <button
                disabled={updating || quote.status === 'aceptada'}
                onClick={() => handleStatusChange('aceptada')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  quote.status === 'aceptada'
                    ? 'bg-[#198754] text-white shadow-sm'
                    : 'bg-white hover:bg-emerald-50 text-[#198754] border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Aceptada (Producción)</span>
              </button>

              <button
                disabled={updating || quote.status === 'rechazada'}
                onClick={() => handleStatusChange('rechazada')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  quote.status === 'rechazada'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white hover:bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <XCircle className="w-3 h-3" />
                <span>Rechazada</span>
              </button>
            </div>
          </div>

          {/* Client & Date Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Cliente Facturable</span>
              <p className="text-sm font-bold text-slate-900">{quote.client?.business_name}</p>
              <p className="text-slate-500">RFC: {quote.client?.rfc}</p>
              <p className="text-slate-500">{quote.client?.contact_name} ({quote.client?.phone})</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 flex flex-col gap-1 justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Datos de Emisión</span>
                <p className="text-slate-700">
                  Fecha de creación: <strong>{new Date(quote.created_at).toLocaleDateString('es-MX')}</strong>
                </p>
                <p className="text-slate-700">
                  Vigencia hasta: <strong>{quote.valid_until}</strong>
                </p>
              </div>
              <span className="text-[10px] text-slate-400">Moneda: Pesos Mexicanos (MXN)</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-700">Partidas de Producción</span>
            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[540px] text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 whitespace-nowrap">Descripción</th>
                      <th className="p-3 text-center whitespace-nowrap">Cant.</th>
                      <th className="p-3 text-center whitespace-nowrap">Unidad</th>
                      <th className="p-3 text-right whitespace-nowrap">Precio Unit.</th>
                      <th className="p-3 text-right whitespace-nowrap">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quote.items && quote.items.length > 0 ? (
                      quote.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 max-w-[280px]">
                            <span className="font-semibold text-slate-800 block break-words leading-tight">{it.description}</span>
                            {it.substrate_finishing && (
                              <p className="text-[11px] text-slate-400 mt-0.5 break-words">{it.substrate_finishing}</p>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono whitespace-nowrap">{it.quantity}</td>
                          <td className="p-3 text-center text-slate-500 whitespace-nowrap">{it.unit}</td>
                          <td className="p-3 text-right font-mono whitespace-nowrap">${Number(it.unit_price).toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                            ${Number(it.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">
                          No hay partidas desglosadas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Technical Notes if present */}
          {quote.technical_notes && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <strong className="text-slate-800 block mb-1">Notas Técnicas:</strong>
              {quote.technical_notes}
            </div>
          )}

          {/* Financial Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 flex flex-col gap-2 text-xs p-4 bg-[#F8FAF8] rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">${Number(quote.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              {Number(quote.discount_amount) > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Descuento:</span>
                  <span className="font-mono">-${Number(quote.discount_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>IVA (16%):</span>
                <span className="font-mono font-semibold">${Number(quote.tax_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-900 font-bold text-slate-900">
                <span className="text-sm">TOTAL:</span>
                <span className="text-xl font-heading text-[#0F5132]">
                  ${Number(quote.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F8FAF8] border-t border-[#E4EAE5] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
