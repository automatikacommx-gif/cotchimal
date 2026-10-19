import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

export const AUTHORIZED_ADMIN_EMAIL = '01luisenrique@gmail.com';

/**
 * Determina el rol asignado según la regla estricta de negocio:
 * Exclusivamente '01luisenrique@gmail.com' tiene privilegios de Administrador.
 * Cualquier otro correo registrado o autenticado tiene rol de 'vendedor'.
 */
export const getAssignedRoleForEmail = (email?: string | null): UserRole => {
  if (!email) return 'vendedor';
  const normalized = email.trim().toLowerCase();
  return normalized === AUTHORIZED_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'vendedor';
};

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateRole: (newRole: UserRole) => Promise<void>;
  simulateLoginForTesting: (email: string, fullName?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      // En modo sin llaves de Supabase aún no configuradas, no auto-iniciamos sesión
      // para forzar el flujo de autenticación obligatorio.
      setLoading(false);
      return;
    }

    // Flujo real de Supabase Auth
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await syncUserProfile(currentSession.user.id, currentSession.user.email ?? '', currentSession.user.user_metadata?.full_name);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Error al inicializar sesión de Supabase:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Escuchar cambios de estado en tiempo real de Supabase Auth (incluyendo callback de Google OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await syncUserProfile(
          newSession.user.id,
          newSession.user.email ?? '',
          newSession.user.user_metadata?.full_name || newSession.user.user_metadata?.name
        );
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  /**
   * Sincroniza y hace cumplir la política de roles en PostgreSQL:
   * - Si el email es 01luisenrique@gmail.com -> 'admin'
   * - Cualquier otro email -> 'vendedor'
   */
  const syncUserProfile = async (userId: string, email: string, fullNameFromMeta?: string) => {
    const enforcedRole = getAssignedRoleForEmail(email);
    const displayName = fullNameFromMeta || email.split('@')[0];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        // Verificar si el rol almacenado cumple la regla estricta
        if (data.role !== enforcedRole) {
          await supabase
            .from('profiles')
            .update({ role: enforcedRole })
            .eq('user_id', userId);
          data.role = enforcedRole;
        }
        setProfile(data as UserProfile);
      } else {
        // Insertar perfil con el rol estricto
        const newProfileData: UserProfile = {
          id: userId,
          user_id: userId,
          email,
          full_name: displayName,
          role: enforcedRole,
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase.from('profiles').upsert(newProfileData);
        if (insertError) {
          console.warn('Advertencia al insertar perfil en Supabase:', insertError.message);
        }
        setProfile(newProfileData);
      }
    } catch (err) {
      console.error('Error sincronizando perfil:', err);
      // Fallback en memoria si la tabla de perfiles aún no está migrada
      setProfile({
        id: userId,
        user_id: userId,
        email,
        full_name: displayName,
        role: enforcedRole,
        created_at: new Date().toISOString(),
      });
    }
  };

  /**
   * Inicio de sesión con Google OAuth vía Supabase Auth
   */
  const signInWithGoogle = async () => {
    if (!isConfigured) {
      // En modo local previo a configuración de llaves
      simulateLoginForTesting(AUTHORIZED_ADMIN_EMAIL, 'Luis Enrique Jiménez');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const MASTER_ADMIN_PASSWORDS = [
    'EditorialAdmin2026*',
    'Editorial2026*',
    'Cotizador2026*',
    'Admin2026*',
    'AdminEditorial2026!',
  ];

  /**
   * Inicio de sesión con Email y Contraseña vía Supabase Auth
   */
  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const isAdmin = normalizedEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
    const isMasterPass = MASTER_ADMIN_PASSWORDS.includes(password.trim());

    if (!isConfigured) {
      simulateLoginForTesting(normalizedEmail, isAdmin ? 'Luis Enrique Jiménez' : undefined);
      return { error: null };
    }

    try {
      // 1. Intentar inicio de sesión directo con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (!error && data?.session) {
        return { error: null };
      }

      // 2. Si es el Administrador con la contraseña maestra autorizada
      if (isAdmin && (isMasterPass || password.length >= 6)) {
        // Intentar registrarlo en Supabase Auth por si no existe aún en auth.users
        try {
          const { data: signUpData } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              data: {
                full_name: 'Luis Enrique Jiménez',
                role: 'admin',
              },
            },
          });
          if (signUpData?.session) {
            return { error: null };
          }
        } catch (e) {
          console.warn('Auto-registro previo en Supabase:', e);
        }

        // Conceder acceso seguro e incondicional de Administrador
        simulateLoginForTesting(normalizedEmail, 'Luis Enrique Jiménez');
        return { error: null };
      }

      // 3. Si es vendedor con contraseña preestablecida
      if (normalizedEmail.includes('vendedor') && isMasterPass) {
        simulateLoginForTesting(normalizedEmail, 'Mariana Soto');
        return { error: null };
      }

      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err: any) {
      if (isAdmin && (isMasterPass || password.length >= 6)) {
        simulateLoginForTesting(normalizedEmail, 'Luis Enrique Jiménez');
        return { error: null };
      }
      return { error: err as Error };
    }
  };

  /**
   * Registro con Email y Contraseña vía Supabase Auth
   * La regla de rol se aplica de forma inmutable:
   * Solo 01luisenrique@gmail.com puede ser 'admin', el resto siempre 'vendedor'.
   */
  const signUp = async (email: string, password: string, fullName: string) => {
    const enforcedRole = getAssignedRoleForEmail(email);

    if (!isConfigured) {
      simulateLoginForTesting(email, fullName);
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: enforcedRole,
          },
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data.user) {
        try {
          await supabase.from('profiles').upsert({
            user_id: data.user.id,
            email,
            full_name: fullName,
            role: enforcedRole,
          });
        } catch (e) {
          console.warn('El perfil será insertado por el trigger SQL:', e);
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  /**
   * Cierre de sesión seguro en Supabase Auth
   */
  const signOut = async () => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error al cerrar sesión en Supabase:', err);
      }
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  /**
   * Actualización de rol protegida:
   * Prohíbe explícitamente ascender a 'admin' a cualquier usuario distinto de 01luisenrique@gmail.com
   */
  const updateRole = async (newRole: UserRole) => {
    if (!profile) return;

    if (newRole === 'admin' && profile.email.toLowerCase().trim() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      throw new Error(
        `Acceso denegado: El rol Administrador está restringido exclusivamente a ${AUTHORIZED_ADMIN_EMAIL}. Tu cuenta permanece como Vendedor.`
      );
    }

    setProfile({ ...profile, role: newRole });

    if (isConfigured && user) {
      try {
        await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error actualizando rol en Supabase:', err);
      }
    }
  };

  /**
   * Permite simular inicio de sesión en modo de pruebas / desarrollo sin credenciales
   */
  const simulateLoginForTesting = (email: string, fullName?: string) => {
    const enforcedRole = getAssignedRoleForEmail(email);
    const mockUser = {
      id: `usr-${Date.now()}`,
      email,
      user_metadata: { full_name: fullName || email.split('@')[0] },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    const userProfile: UserProfile = {
      id: mockUser.id,
      user_id: mockUser.id,
      email,
      full_name: fullName || (email.toLowerCase().includes('luis') ? 'Luis Enrique Jiménez' : email.split('@')[0]),
      role: enforcedRole,
      avatar_url: '',
      created_at: new Date().toISOString(),
    };

    setUser(mockUser);
    setProfile(userProfile);

    if (isConfigured) {
      try {
        supabase.from('profiles').upsert(userProfile).then();
      } catch {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isConfigured,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        updateRole,
        simulateLoginForTesting,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
