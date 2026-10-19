import React, { useRef, useState } from 'react';
import { CompanySettings } from '../../../types';
import { uploadToSupabaseStorage } from '../../../lib/storage';
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Upload,
  Check,
  FileCheck,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface Step1Props {
  data: CompanySettings;
  onChange: (updated: Partial<CompanySettings>) => void;
  onNext: () => void;
}

const COLOR_SWATCHES = [
  '#10B981', // Emerald
  '#15803D', // Forest green
  '#0D9488', // Teal
  '#0284C7', // Blue
  '#4338CA', // Indigo
  '#7E22CE', // Purple
  '#BE185D', // Magenta / Berry
  '#DC2626', // Red
  '#EA580C', // Orange / Rust
  '#B45309', // Amber / Golden
  '#334155', // Slate / Charcoal
  '#78350F', // Dark Brown
];

export const Step1CompanyInfo: React.FC<Step1Props> = ({ data, onChange, onNext }) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const { url } = await uploadToSupabaseStorage(file, 'logos');
      if (url) {
        onChange({ logo_url: url });
      }
    } catch (err) {
      console.error('Error al subir logo:', err);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPdf(true);
    try {
      const { url } = await uploadToSupabaseStorage(file, 'letterheads');
      if (url) {
        onChange({ letterhead_pdf_url: url });
      }
    } catch (err) {
      console.error('Error al subir PDF membretado:', err);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.contact_name?.trim()) {
      newErrors.contact_name = 'El nombre del responsable es obligatorio';
    }
    if (!data.company_name?.trim()) {
      newErrors.company_name = 'El nombre de la imprenta es obligatorio';
    }
    if (!data.city?.trim()) {
      newErrors.city = 'La ciudad es obligatoria';
    }
    if (!data.phone?.trim()) {
      newErrors.phone = 'El teléfono o WhatsApp es obligatorio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof CompanySettings, value: string) => {
    onChange({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setHasAttemptedSubmit(true);
    if (!validate()) {
      return;
    }
    onNext();
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#E9E4D9] shadow-sm flex flex-col gap-8">
      {/* Header Info */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-black tracking-widest text-[#10B981] uppercase">
          PASO 1 DE 5
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#262422] tracking-tight font-heading">
          Tu imprenta
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Esta información aparece en tus cotizaciones y PDFs. Tarda menos de dos minutos.
        </p>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Nombre del Responsable */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Nombre del Responsable *</span>
          </label>
          <input
            type="text"
            value={data.contact_name}
            onChange={(e) => handleFieldChange('contact_name', e.target.value)}
            placeholder="luis jimenez"
            className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all ${
              errors.contact_name
                ? 'bg-red-50/30 border-2 border-[#DC2626] text-slate-800 ring-2 ring-red-500/10 focus:border-[#DC2626]'
                : 'bg-[#F4F7F5] border border-slate-200 text-slate-800 focus:bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20'
            }`}
            required
          />
          {errors.contact_name && (
            <span className="text-[11px] font-bold text-[#DC2626]">
              {errors.contact_name}
            </span>
          )}
        </div>

        {/* Nombre de la Imprenta */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Nombre de la Imprenta *</span>
          </label>
          <input
            type="text"
            value={data.company_name}
            onChange={(e) => handleFieldChange('company_name', e.target.value)}
            placeholder="editorial jimenez"
            className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all ${
              errors.company_name
                ? 'bg-red-50/30 border-2 border-[#DC2626] text-slate-800 ring-2 ring-red-500/10 focus:border-[#DC2626]'
                : 'bg-[#F4F7F5] border border-slate-200 text-slate-800 focus:bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20'
            }`}
            required
          />
          {errors.company_name && (
            <span className="text-[11px] font-bold text-[#DC2626]">
              {errors.company_name}
            </span>
          )}
        </div>

        {/* Ciudad */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Ciudad *</span>
          </label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            placeholder="toluca"
            className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all ${
              errors.city
                ? 'bg-red-50/30 border-2 border-[#DC2626] text-slate-800 ring-2 ring-red-500/10 focus:border-[#DC2626]'
                : 'bg-[#F4F7F5] border border-slate-200 text-slate-800 focus:bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20'
            }`}
            required
          />
          {errors.city && (
            <span className="text-[11px] font-bold text-[#DC2626]">
              {errors.city}
            </span>
          )}
        </div>

        {/* WhatsApp / Teléfono */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>WhatsApp / Teléfono *</span>
          </label>
          <input
            type="text"
            value={data.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            placeholder="7226201052"
            className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all ${
              errors.phone
                ? 'bg-red-50/30 border-2 border-[#DC2626] text-slate-800 ring-2 ring-red-500/10 focus:border-[#DC2626]'
                : 'bg-[#F4F7F5] border border-slate-200 text-slate-800 focus:bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20'
            }`}
            required
          />
          {errors.phone && (
            <span className="text-[11px] font-bold text-[#DC2626]">
              {errors.phone}
            </span>
          )}
        </div>

        {/* Correo de Contacto */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>Correo de Contacto</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            placeholder="01luisenrique@gmail.com"
            className="w-full px-4 py-3 bg-[#F4F7F5] border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-none transition-all"
          />
        </div>

        {/* RFC Opcional */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>RFC</span>
            </label>
            <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              OPCIONAL
            </span>
          </div>
          <input
            type="text"
            value={data.rfc || ''}
            onChange={(e) => handleFieldChange('rfc', e.target.value.toUpperCase())}
            placeholder="Ej. IMP-930101-XXX"
            className="w-full px-4 py-3 bg-[#F4F7F5] border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Logo de la Imprenta [Opcional] */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            LOGO DE LA IMPRENTA
          </span>
          <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            OPCIONAL
          </span>
        </div>

        <input
          type="file"
          ref={logoInputRef}
          onChange={handleLogoUpload}
          accept="image/png, image/jpeg, image/svg+xml"
          className="hidden"
        />

        <div
          onClick={() => logoInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-[#10B981] bg-[#FBFDFB] hover:bg-[#F0FDF4] rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group"
        >
          {isUploadingLogo ? (
            <div className="flex items-center gap-3 py-2 text-slate-600">
              <span className="w-5 h-5 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold">Subiendo logo a Supabase Storage...</span>
            </div>
          ) : data.logo_url ? (
            <div className="flex items-center gap-4">
              <img
                src={data.logo_url}
                alt="Logo preview"
                className="w-14 h-14 object-contain rounded-lg border border-slate-200 bg-white p-1"
              />
              <div className="text-left">
                <span className="text-xs font-bold text-slate-700 block">Logo cargado y sincronizado</span>
                <span className="text-[11px] text-[#10B981] font-semibold underline">
                  Haz clic para cambiar archivo
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#10B981] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-700 block">
                  Clic para subir tu logo
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  PNG, JPG o SVG · Aparece en los PDFs de cotización
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Papelería tamaño carta (PDF) [Opcional] - Justo debajo del Logotipo */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              PAPELERÍA TAMAÑO CARTA (PDF)
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              OPCIONAL
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Hoja membretada para impresiones de cotización
          </span>
        </div>

        <input
          type="file"
          ref={pdfInputRef}
          onChange={handlePdfUpload}
          accept="application/pdf"
          className="hidden"
        />

        <div className="border-2 border-dashed border-slate-300 hover:border-[#10B981] bg-[#FBFDFB] hover:bg-[#F0FDF4] rounded-2xl p-5 sm:p-6 transition-all">
          {isUploadingPdf ? (
            <div className="flex items-center justify-center gap-3 py-2 text-slate-600">
              <span className="w-5 h-5 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold">Subiendo PDF a Supabase Storage...</span>
            </div>
          ) : data.letterhead_pdf_url ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-xs border border-red-100 shrink-0">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-800 block">
                    Papelería membretada cargada
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                    <Check className="w-3.5 h-3.5" /> Archivo PDF listo para el generador de cotizaciones
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={data.letterhead_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver PDF</span>
                </a>
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl border border-[#10B981]/30 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-[#10B981] transition-colors cursor-pointer"
                >
                  Reemplazar
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ letterhead_pdf_url: '' })}
                  className="p-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                  title="Eliminar papelería"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => pdfInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 cursor-pointer text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#10B981] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-700 block">
                  Clic para subir tu papelería tamaño carta (PDF)
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Documento PDF tamaño carta (21.59 × 27.94 cm) · Se almacena en Supabase Storage
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Color de Acentos del PDF */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            COLOR DE ACENTOS DEL PDF
          </span>
          <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            OPCIONAL
          </span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          El color de la barra, títulos y total en tus cotizaciones. El resto del PDF no cambia.
        </p>

        {/* Circular Swatches */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {COLOR_SWATCHES.map((swatch) => {
            const isSelected = data.accent_color.toLowerCase() === swatch.toLowerCase();
            return (
              <button
                key={swatch}
                type="button"
                onClick={() => onChange({ accent_color: swatch })}
                style={{ backgroundColor: swatch }}
                className={`w-9 h-9 rounded-full transition-transform flex items-center justify-center cursor-pointer shadow-xs ${
                  isSelected ? 'ring-4 ring-[#10B981]/30 scale-110' : 'hover:scale-105'
                }`}
                aria-label={`Color ${swatch}`}
              >
                {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Footer (Referral code completely removed) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
        {hasAttemptedSubmit && Object.keys(errors).length > 0 ? (
          <p className="text-xs font-bold text-[#DC2626] text-center sm:text-left">
            Completa los campos obligatorios marcados en rojo para continuar.
          </p>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all bg-[#10B981] hover:bg-[#059669] cursor-pointer active:scale-[0.98]"
        >
          <span>Continuar</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
