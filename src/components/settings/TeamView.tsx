import React, { useState, useEffect } from 'react';
import { TeamMember, SectionPermissions, UserRole } from '../../types';
import { teamService, DEFAULT_SECTION_PERMISSIONS, ADMIN_SECTION_PERMISSIONS } from '../../services/teamService';
import { 
  UserPlus, 
  Lock, 
  X, 
  Mail, 
  Shield, 
  Trash2, 
  Sparkles,
  Check
} from 'lucide-react';

interface TeamViewProps {
  onShowToast: (toast: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({ onShowToast }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('miembro');
  const [permissions, setPermissions] = useState<SectionPermissions>({ ...DEFAULT_SECTION_PERMISSIONS });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeam = async () => {
    const { data } = await teamService.getMembers();
    setMembers(data);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setInviteRole(role);
    if (role === 'admin') {
      setPermissions({ ...ADMIN_SECTION_PERMISSIONS });
    } else if (role === 'seller') {
      setPermissions({
        resumen: 'lectura',
        cotizar: 'acceso',
        clientes: 'edicion',
        tarifario: 'sin_acceso',
        prensas: 'sin_acceso',
        papeles: 'sin_acceso',
      });
    } else {
      setPermissions({ ...DEFAULT_SECTION_PERMISSIONS });
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      onShowToast({ type: 'error', message: 'Por favor ingresa un correo válido' });
      return;
    }

    if (inviteRole === 'admin' && inviteEmail.trim().toLowerCase() !== '01luisenrique@gmail.com') {
      onShowToast({
        type: 'error',
        message: 'El rol Administrador está restringido exclusivamente a 01luisenrique@gmail.com. Asigna Vendedor o Miembro.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await teamService.inviteMember({
        email: inviteEmail.trim(),
        role: inviteRole,
        permissions,
      });

      if (error || !data) {
        throw new Error(error || 'Error al enviar invitación');
      }

      setMembers([...members, data]);
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('miembro');
      setPermissions({ ...DEFAULT_SECTION_PERMISSIONS });
      onShowToast({
        type: 'success',
        message: `Invitación enviada con éxito a ${data.email}`,
      });
    } catch (err: any) {
      onShowToast({ type: 'error', message: err.message || 'No se pudo enviar la invitación' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (id: string, name: string) => {
    const { success, error } = await teamService.removeMember(id);
    if (!success) {
      onShowToast({ type: 'error', message: error || 'No se pudo eliminar el miembro' });
      return;
    }
    setMembers(members.filter((m) => m.id !== id));
    onShowToast({ type: 'info', message: `Miembro ${name} removido del equipo` });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-16">
      {/* Sub-header Breadcrumb matching Image 7 */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-bold text-slate-400">Equipo</span>
        <span className="text-xs font-medium text-slate-400">Usuarios y permisos</span>
      </div>

      {/* Main Header Row with Title, Counter Badge and Invite Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-black text-[#262422] font-heading tracking-tight">
            Equipo
          </h2>
          {/* Pill Badge matching Image 7: 1 / 5 usuarios */}
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#10B981] border border-[#10B981]/30">
            {members.length} / 5 usuarios
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Invitar usuario</span>
        </button>
      </div>

      {/* Team Members List matching Image 7 */}
      <div className="flex flex-col gap-3.5">
        {members.map((member) => {
          const initials = getInitials(member.full_name || member.email);
          const isOwner = member.is_owner || member.role === 'dueño';

          return (
            <div
              key={member.id}
              className="bg-[#FFFDF9] rounded-2xl border border-[#E9E4D9] p-5 sm:p-6 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-all"
            >
              {/* Left: Avatar + Details */}
              <div className="flex items-center gap-4">
                {/* Circular Green Avatar with initials */}
                <div className="w-12 h-12 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                  {initials}
                </div>

                <div className="flex flex-col gap-1">
                  {/* Name and Role Pill */}
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-[#262422] leading-none">
                      {member.full_name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#DCFCE7] text-[#10B981]">
                      {member.role_label || (isOwner ? 'Dueño' : member.role)}
                    </span>
                  </div>

                  {/* Email */}
                  <span className="text-xs text-slate-500 font-medium">
                    {member.email}
                  </span>

                  {/* Access tag: ✦ Acceso total */}
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#10B981] mt-0.5">
                    <span>{member.access_label || '✦ Acceso total'}</span>
                  </div>
                </div>
              </div>

              {/* Right: Lock Badge / Actions */}
              <div className="flex items-center gap-3">
                {isOwner ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5EFEB] border border-[#E9E4D9] text-xs font-bold text-slate-600 select-none">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Intocable</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id, member.full_name)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remover usuario"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Invitar Usuario Modal matching Image 8 */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Dark Top Bar matching Image 8 */}
            <div className="bg-[#1E1C1A] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold font-heading tracking-wide">
                Invitar usuario
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleInviteSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto">
              {/* Field 1: CORREO */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>CORREO</span>
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="persona@imprenta.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
                />
              </div>

              {/* Field 2: ROL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>ROL</span>
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
                >
                  <option value="miembro">Miembro — permisos por sección</option>
                  <option value="seller">Vendedor — cotizaciones y clientes</option>
                  <option value="admin">Administrador — acceso total</option>
                </select>
              </div>

              {/* Section: Permisos por sección matching Image 8 */}
              <div className="flex flex-col gap-3 pt-2">
                <span className="text-xs font-bold text-slate-500">
                  Permisos por sección
                </span>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {/* Resumen */}
                  <div className="p-3 bg-[#FAF8F5]/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Resumen</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {(['sin_acceso', 'lectura', 'edicion'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPermissions({ ...permissions, resumen: mode })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                            permissions.resumen === mode
                              ? 'bg-[#10B981] text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {mode.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cotizar */}
                  <div className="p-3 bg-white flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Cotizar</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {(['sin_acceso', 'acceso'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPermissions({ ...permissions, cotizar: mode })}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                            permissions.cotizar === mode
                              ? 'bg-[#10B981] text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {mode.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clientes */}
                  <div className="p-3 bg-[#FAF8F5]/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Clientes</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {(['sin_acceso', 'lectura', 'edicion'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPermissions({ ...permissions, clientes: mode })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                            permissions.clientes === mode
                              ? 'bg-[#10B981] text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {mode.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tarifario */}
                  <div className="p-3 bg-white flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Tarifario</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {(['sin_acceso', 'lectura', 'edicion'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPermissions({ ...permissions, tarifario: mode })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                            permissions.tarifario === mode
                              ? 'bg-[#10B981] text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {mode.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prensas */}
                  <div className="p-3 bg-[#FAF8F5]/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Prensas</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {(['sin_acceso', 'lectura', 'edicion'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPermissions({ ...permissions, prensas: mode })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                            permissions.prensas === mode
                              ? 'bg-[#10B981] text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {mode.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Papeles */}
                  <div className="p-3 bg-white flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Papeles</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {(['sin_acceso', 'lectura', 'edicion'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPermissions({ ...permissions, papeles: mode })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                            permissions.papeles === mode
                              ? 'bg-[#10B981] text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {mode.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer with Cancelar & Enviar invitación */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
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
                    <span>Enviando...</span>
                  ) : (
                    <span>Enviar invitación</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
