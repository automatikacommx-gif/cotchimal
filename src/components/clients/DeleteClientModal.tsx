import React, { useState } from 'react';
import { Client } from '../../types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteClientModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteClientModal: React.FC<DeleteClientModalProps> = ({
  isOpen,
  client,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !client) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(client.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            ¿Eliminar expediente de cliente?
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Estás a punto de eliminar a <strong className="text-slate-800">{client.business_name}</strong> (RFC: {client.rfc}).
            Esta acción se registrará en la base de datos de Supabase.
          </p>
        </div>

        <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-[11px] text-red-800">
          Nota: Si el cliente cuenta con cotizaciones asociadas, se preservará la integridad referencial o se desvinculará según las políticas RLS.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
