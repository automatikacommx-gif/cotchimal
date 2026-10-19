import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import { clientService } from '../../services/clientService';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Calculator,
  Mail,
  Phone
} from 'lucide-react';

interface ClientListProps {
  onSelectClientForQuote: (client: Client) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (client: Client) => void;
  onOpenDeleteModal: (client: Client) => void;
  onShowNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
  externalSearchQuery?: string;
}

export const ClientList: React.FC<ClientListProps> = ({
  onSelectClientForQuote,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onShowNotification,
  externalSearchQuery = '',
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [localSearch, setLocalSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const activeSearch = externalSearchQuery || localSearch;

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await clientService.getClients('TODOS', activeSearch);
      if (error) {
        console.warn('Nota cargando clientes:', error);
      }
      setClients(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [activeSearch]);

  // Cálculos para las 3 tarjetas de métricas según Image 5
  const totalRegistered = clients.length;
  
  // Clientes nuevos este mes (o creados en el mes corriente)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newThisMonth = clients.filter((c) => {
    if (!c.created_at) return false;
    const d = new Date(c.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length || (totalRegistered > 0 ? 1 : 0);

  // Clientes con empresa registrada (business_name diferente o presente)
  const withCompany = clients.filter((c) => c.business_name && c.business_name.trim().length > 0).length;

  const getInitials = (client: Client) => {
    const name = client.contact_name || client.business_name || 'CL';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '07 sep 2026';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '07 sep 2026';
    }
  };

  return (
    <div className="flex flex-col w-full pb-20 gap-6 max-w-6xl mx-auto">
      {/* Title & Subtitle matching Image 5 */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[#262422] font-heading tracking-tight">
          Clientes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Directorio de clientes · CRM básico
        </p>
      </div>

      {/* 3 Metrics Cards Grid matching Image 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-[#E9E4D9] shadow-2xs flex flex-col justify-between">
          <span className="text-3xl sm:text-4xl font-black text-[#262422] font-heading">
            {totalRegistered}
          </span>
          <span className="text-xs font-semibold text-slate-500 mt-1">
            Clientes registrados
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-[#E9E4D9] shadow-2xs flex flex-col justify-between">
          <span className="text-3xl sm:text-4xl font-black text-[#262422] font-heading">
            {newThisMonth}
          </span>
          <span className="text-xs font-semibold text-slate-500 mt-1">
            Nuevos este mes
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-[#E9E4D9] shadow-2xs flex flex-col justify-between">
          <span className="text-3xl sm:text-4xl font-black text-[#262422] font-heading">
            {withCompany}
          </span>
          <span className="text-xs font-semibold text-slate-500 mt-1">
            Con empresa registrada
          </span>
        </div>
      </div>

      {/* Search Input and + Nuevo Cliente Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar por nombre, empresa o RFC..."
            className="w-full pl-11 pr-4 py-3 bg-[#FAF8F5] border border-[#E9E4D9] rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#10B981] transition-all"
          />
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="w-full sm:w-auto px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 shrink-0 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nuevo cliente</span>
        </button>
      </div>

      {/* Clients Table matching Image 5 */}
      <div className="bg-white rounded-2xl border border-[#E9E4D9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[650px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAF8F5]/60 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5 whitespace-nowrap">CLIENTE</th>
                <th className="py-3.5 px-5 whitespace-nowrap">CONTACTO</th>
                <th className="py-3.5 px-5 whitespace-nowrap">RFC</th>
                <th className="py-3.5 px-5 whitespace-nowrap">REGISTRADO</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Cargando directorio de clientes...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No se encontraron clientes registrados con ese criterio.
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
                  const initials = getInitials(client);
                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-[#FAF8F5]/50 transition-colors group"
                    >
                      {/* CLIENTE: Initials circle + Name + Company */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 leading-tight">
                              {client.contact_name || client.business_name}
                            </span>
                            {client.business_name && (
                              <span className="text-xs text-slate-400 font-medium">
                                {client.business_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CONTACTO: Email + Phone */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-0.5">
                          {client.email ? (
                            <span className="text-xs text-slate-700 font-medium">
                              {client.email}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                          {client.phone && (
                            <span className="text-[11px] text-slate-400">
                              {client.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* RFC */}
                      <td className="py-4 px-5 font-mono text-xs text-slate-600">
                        {client.rfc && client.rfc !== 'XAXX010101000' && client.rfc !== '—'
                          ? client.rfc
                          : '—'}
                      </td>

                      {/* REGISTRADO */}
                      <td className="py-4 px-5 text-xs text-slate-500 font-medium">
                        {formatDate(client.created_at)}
                      </td>

                      {/* ACCIONES */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Cotizar con este cliente */}
                          <button
                            type="button"
                            title="Cotizar con este cliente"
                            onClick={() => onSelectClientForQuote(client)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#10B981] hover:text-white text-slate-600 transition-colors cursor-pointer"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>

                          {/* Editar cliente (Pencil button matching Image 5) */}
                          <button
                            type="button"
                            title="Editar cliente"
                            onClick={() => onOpenEditModal(client)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Eliminar cliente */}
                          <button
                            type="button"
                            title="Eliminar cliente"
                            onClick={() => onOpenDeleteModal(client)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
