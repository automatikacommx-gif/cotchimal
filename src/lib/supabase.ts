import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lectura de variables de entorno de Vite o credenciales del proyecto configuradas
const DEFAULT_SUPABASE_URL = 'https://ujhnhunrhbmefzeliwgt.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqaG5odW5yaGJtZWZ6ZWxpd2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTY2MDUsImV4cCI6MjEwNDUzMjYwNX0.qQHqp2uJgsYUgrugWya2IVWCyIhWqqJ-iXHkzjgUXJ8';

const envSupabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envSupabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Permitir configuración dinámica en tiempo de ejecución (si el usuario la ingresa en el modal o la guarda en local)
let runtimeSupabaseUrl = '';
let runtimeSupabaseAnonKey = '';

try {
  runtimeSupabaseUrl = 
    localStorage.getItem('CUSTOM_SUPABASE_URL') || 
    sessionStorage.getItem('CUSTOM_SUPABASE_URL') || 
    '';
  runtimeSupabaseAnonKey = 
    localStorage.getItem('CUSTOM_SUPABASE_ANON_KEY') || 
    sessionStorage.getItem('CUSTOM_SUPABASE_ANON_KEY') || 
    '';
} catch {
  // Ignorar errores de sandbox si storage no está disponible
}

export const activeSupabaseUrl = (runtimeSupabaseUrl || envSupabaseUrl || DEFAULT_SUPABASE_URL).trim();
export const activeSupabaseAnonKey = (runtimeSupabaseAnonKey || envSupabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY).trim();

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(activeSupabaseUrl) &&
    Boolean(activeSupabaseAnonKey) &&
    !activeSupabaseUrl.includes('your-project') &&
    !activeSupabaseUrl.includes('placeholder') &&
    activeSupabaseUrl.startsWith('https://')
  );
};

/**
 * Detecta si el error de Supabase se debe a que las tablas aún no han sido
 * creadas en la base de datos PostgreSQL (PGRST205 / 42P01 / schema cache).
 */
export const isTableMissingError = (error: any): boolean => {
  if (!error) return false;
  const code = String(error.code || '');
  const message = typeof error.message === 'string' ? error.message : '';
  const details = typeof error.details === 'string' ? error.details : '';
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    message.includes('Could not find the table') ||
    message.includes('schema cache') ||
    (message.includes('relation') && message.includes('does not exist')) ||
    details.includes('Could not find the table')
  );
};

type TablesStatusListener = (isReady: boolean) => void;
const tableStatusListeners: TablesStatusListener[] = [];
let supabaseTablesReady: boolean | null = null;

export const getSupabaseTablesStatus = (): boolean | null => supabaseTablesReady;

export const setSupabaseTablesStatus = (isReady: boolean) => {
  if (supabaseTablesReady !== isReady) {
    supabaseTablesReady = isReady;
    tableStatusListeners.forEach((fn) => fn(isReady));
  }
};

export const subscribeToTablesStatus = (listener: TablesStatusListener) => {
  tableStatusListeners.push(listener);
  if (supabaseTablesReady !== null) {
    listener(supabaseTablesReady);
  }
  return () => {
    const idx = tableStatusListeners.indexOf(listener);
    if (idx !== -1) tableStatusListeners.splice(idx, 1);
  };
};

// Cliente Singleton de Supabase
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const url = activeSupabaseUrl || 'https://placeholder.supabase.co';
  const key = activeSupabaseAnonKey || 'placeholder-anon-key';

  supabaseInstance = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseInstance;
};

export const supabase = getSupabaseClient();

/**
 * Guarda credenciales personalizadas de Supabase ingresadas por el usuario en tiempo de ejecución
 */
export const setRuntimeSupabaseConfig = (url: string, key: string) => {
  try {
    const cleanUrl = url.trim();
    const cleanKey = key.trim();
    localStorage.setItem('CUSTOM_SUPABASE_URL', cleanUrl);
    localStorage.setItem('CUSTOM_SUPABASE_ANON_KEY', cleanKey);
    sessionStorage.setItem('CUSTOM_SUPABASE_URL', cleanUrl);
    sessionStorage.setItem('CUSTOM_SUPABASE_ANON_KEY', cleanKey);
    // Reiniciar instancia
    supabaseInstance = null;
    window.location.reload();
  } catch (error) {
    console.error('Error guardando configuración de Supabase:', error);
  }
};

/**
 * Limpia las credenciales en tiempo de ejecución
 */
export const clearRuntimeSupabaseConfig = () => {
  try {
    localStorage.removeItem('CUSTOM_SUPABASE_URL');
    localStorage.removeItem('CUSTOM_SUPABASE_ANON_KEY');
    sessionStorage.removeItem('CUSTOM_SUPABASE_URL');
    sessionStorage.removeItem('CUSTOM_SUPABASE_ANON_KEY');
    supabaseInstance = null;
    window.location.reload();
  } catch (error) {
    console.error('Error al limpiar configuración:', error);
  }
};
