import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TeamMember, SectionPermissions, UserRole } from '../types';

export const DEFAULT_SECTION_PERMISSIONS: SectionPermissions = {
  resumen: 'lectura',
  cotizar: 'acceso',
  clientes: 'edicion',
  tarifario: 'sin_acceso',
  prensas: 'sin_acceso',
  papeles: 'sin_acceso',
};

export const ADMIN_SECTION_PERMISSIONS: SectionPermissions = {
  resumen: 'edicion',
  cotizar: 'acceso',
  clientes: 'edicion',
  tarifario: 'edicion',
  prensas: 'edicion',
  papeles: 'edicion',
};

// Usuario inicial conforme a la imagen de referencia (Image 7)
const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-owner-1',
    user_id: '00000000-0000-0000-0000-000000000001',
    email: '01luisenrique@gmail.com',
    full_name: 'luis jimenez',
    role: 'dueño',
    is_owner: true,
    role_label: 'Dueño',
    access_label: '✦ Acceso total',
    permissions: ADMIN_SECTION_PERMISSIONS,
    created_at: '2026-01-01T00:00:00Z',
  },
];

let localTeamStore: TeamMember[] = [...INITIAL_TEAM_MEMBERS];

export const teamService = {
  /**
   * Obtiene todos los miembros del equipo
   */
  async getMembers(): Promise<{ data: TeamMember[]; error: string | null }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Nota team_members Supabase:', error.message);
          return { data: localTeamStore, error: null };
        }

        if (data && data.length > 0) {
          return { data: data as TeamMember[], error: null };
        }
      } catch (err: any) {
        console.warn('Error leyendo team_members en Supabase:', err);
      }
    }
    return { data: localTeamStore, error: null };
  },

  /**
   * Invita o crea un nuevo miembro de equipo
   */
  async inviteMember(memberData: {
    email: string;
    role: UserRole;
    permissions: SectionPermissions;
  }): Promise<{ data: TeamMember | null; error: string | null }> {
    const email = memberData.email.trim();
    if (!email) return { data: null, error: 'El correo electrónico es requerido' };

    if (memberData.role === 'admin' && email.toLowerCase() !== '01luisenrique@gmail.com') {
      return {
        data: null,
        error: 'Restricción de seguridad: El rol de Administrador está reservado exclusivamente para 01luisenrique@gmail.com. Los miembros adicionales deben registrarse como Vendedor o Miembro.',
      };
    }

    const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ');
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      email,
      full_name: nameFromEmail,
      role: memberData.role,
      is_owner: false,
      role_label:
        memberData.role === 'admin'
          ? 'Administrador'
          : memberData.role === 'seller'
          ? 'Vendedor'
          : 'Miembro',
      access_label:
        memberData.role === 'admin' ? '✦ Acceso total' : '• Permisos configurados',
      permissions: memberData.permissions,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .insert([newMember])
          .select()
          .single();

        if (error) {
          console.warn('Nota insert team_members:', error.message);
        } else if (data) {
          localTeamStore.push(data as TeamMember);
          return { data: data as TeamMember, error: null };
        }
      } catch (err: any) {
        console.warn('Error guardando miembro en Supabase:', err);
      }
    }

    localTeamStore.push(newMember);
    return { data: newMember, error: null };
  },

  /**
   * Elimina un miembro del equipo (no aplicable a dueños)
   */
  async removeMember(id: string): Promise<{ success: boolean; error: string | null }> {
    const member = localTeamStore.find((m) => m.id === id);
    if (member?.is_owner) {
      return { success: false, error: 'No es posible remover al dueño de la cuenta' };
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('team_members').delete().eq('id', id);
      } catch (err: any) {
        console.warn('Error eliminando miembro de Supabase:', err);
      }
    }

    localTeamStore = localTeamStore.filter((m) => m.id !== id);
    return { success: true, error: null };
  },
};
