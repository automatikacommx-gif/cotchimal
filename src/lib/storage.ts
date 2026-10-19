import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Sube un archivo a Supabase Storage en el bucket 'company-assets'.
 * Si el bucket o servicio falla, utiliza un data URL base64 como respaldo
 * para garantizar continuidad sin bloquear la experiencia del usuario.
 */
export async function uploadToSupabaseStorage(
  file: File,
  folder: 'logos' | 'letterheads' | 'docs' = 'docs'
): Promise<{ url: string; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const fileExt = file.name.split('.').pop() || 'bin';
      const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const filePath = `${folder}/${Date.now()}_${cleanName}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from('company-assets')
          .getPublicUrl(data.path);

        if (publicData?.publicUrl) {
          return { url: publicData.publicUrl };
        }
      } else if (error) {
        console.warn('Advertencia al subir a Supabase Storage:', error.message);
      }
    } catch (err: any) {
      console.warn('Excepción de Supabase Storage:', err?.message || err);
    }
  }

  // Fallback a Base64 data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ url: reader.result as string });
    };
    reader.onerror = () => {
      resolve({ url: '', error: 'Error al leer el archivo localmente' });
    };
    reader.readAsDataURL(file);
  });
}
