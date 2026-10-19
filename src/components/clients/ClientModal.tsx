import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import { X, User, Briefcase, Mail, Phone, FileText, MapPin, AlertCircle } from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<Client>) => Promise<void>;
  clientToEdit?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
}) => {
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+52');
  const [rfc, setRfc] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (clientToEdit) {
      setFullName(clientToEdit.contact_name || clientToEdit.business_name || '');
      setCompany(clientToEdit.business_name || '');
      setEmail(clientToEdit.email || '');
      setPhone(clientToEdit.phone || '');
      setRfc(clientToEdit.rfc && clientToEdit.rfc !== 'XAXX010101000' ? clientToEdit.rfc : '');
      setAddress(clientToEdit.address || '');
    } else {
      setFullName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setPhonePrefix('+52');
      setRfc('');
      setAddress('');
    }
    setErrorMsg(null);
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validación obligatoria de NOMBRE COMPLETO *
    if (!fullName.trim()) {
      setErrorMsg('El nombre completo es obligatorio (*)');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullPhone = phone.trim() ? (phone.startsWith('+') ? phone : `${phonePrefix} ${phone.trim()}`) : '';

      await onSave({
        contact_name: fullName.trim(),
        business_name: company.trim() || fullName.trim(),
        email: email.trim(),
        phone: fullPhone,
        rfc: rfc.trim() ? rfc.trim().toUpperCase() : '—',
        address: address.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Dark Header matching Image 6 */}
        <div className="bg-[#1E1C1A] text-white px-6 py-4.5 flex items-center justify-between">
          <h3 className="text-base font-bold font-heading tracking-wide">
            {clientToEdit ? 'Editar cliente' : 'Nuevo cliente'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 flex flex-col gap-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Nombre Completo * & Empresa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>NOMBRE COMPLETO <span className="text-rose-500 font-black">*</span></span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Ej. Liliana Chimal"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                  !fullName && errorMsg
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-200 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20'
                }`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>EMPRESA</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ej. Chimalinos S.A. de C.V."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
              />
            </div>
          </div>

          {/* Row 2: Email & Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>EMAIL</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@ejemplo.com"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>TELÉFONO</span>
              </label>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-[#10B981]/20 transition-all">
                <div className="bg-[#FAF8F5] border-r border-slate-200 px-2.5 py-2.5 text-xs font-bold text-slate-600 flex items-center gap-1 shrink-0 select-none">
                  <span>MX</span>
                  <span className="text-[10px] text-slate-400">+52</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="33 1234 5678"
                  className="w-full px-3 py-2.5 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Row 3: RFC & Dirección */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>RFC</span>
              </label>
              <input
                type="text"
                value={rfc}
                onChange={(e) => setRfc(e.target.value.toUpperCase())}
                placeholder="XAXX010101000"
                maxLength={13}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 uppercase font-mono focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>DIRECCIÓN</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, número, colonia, ciudad"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
              />
            </div>
          </div>

          {/* Footer with Cancelar & Guardar cliente */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Guardando...</span>
              ) : (
                <span>Guardar cliente</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
