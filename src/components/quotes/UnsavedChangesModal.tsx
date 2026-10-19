import React from 'react';
import { Save, AlertCircle } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onDiscard: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onDiscard,
  onSaveDraft,
  isSaving = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#E9E4D9] shadow-2xl flex flex-col items-center text-center">
        {/* Yellow/Orange Squircle Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#B45309] mb-4 shadow-2xs">
          <Save className="w-8 h-8 stroke-[2.2]" />
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-[#262422] tracking-tight font-heading">
          ¿Guardar antes de salir?
        </h3>

        {/* Explanation Card */}
        <div className="mt-3 w-full bg-[#F5EFEB] rounded-2xl p-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium text-center">
          Puedes retomar esta cotización la próxima vez que abras el cotizador — todo quedará guardado tal como está.
        </div>

        {/* Actions Buttons */}
        <div className="flex items-center justify-between w-full gap-3 mt-6">
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className="flex-1 py-3 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Descartar cambios
          </button>

          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="flex-1 py-3 px-4 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              <span>Guardar cambios</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
