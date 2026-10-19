/**
 * Paleta de Colores y Configuración de Marca Corporativa
 * Grupo Chimal - Soluciones Gráficas
 * Diseñado para fácil personalización de marca.
 */

export interface ThemeConfig {
  name: string;
  colors: {
    primary: string; // Azul corporativo o color primario de marca
    primaryHover: string;
    secondary: string; // Teal / Verde azulado
    accent: string; // Ámbar / Alerta
    action: string; // Naranja de acción / conversión del taller
    actionHover: string;
    actionLight: string;
    forestDeep: string; // Verde bosque institucional
    forestMedium: string;
    emeraldAction: string; // Verde producción / aprobado
    mintSoft: string;
    background: string; // #F8FAFC o #F8FAF8
    surfaceCard: string; // #FFFFFF
    textMain: string; // #0F172A
    textMuted: string; // #475569
    borderSubtle: string; // #E2E8F0
  };
}

export const defaultTheme: ThemeConfig = {
  name: 'Grupo Chimal Corporativo',
  colors: {
    primary: '#1E3A8A', // Azul corporativo
    primaryHover: '#1E40AF',
    secondary: '#0D9488', // Teal
    accent: '#F59E0B', // Ámbar
    action: '#D9531E', // Acción comercial naranja
    actionHover: '#C84B15',
    actionLight: '#FFECE5',
    forestDeep: '#0F5132', // Verde bosque
    forestMedium: '#107C41',
    emeraldAction: '#198754', // Verde esmeralda producción
    mintSoft: '#D1E7DD',
    background: '#F8FAF8',
    surfaceCard: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#475569',
    borderSubtle: '#E4EAE5',
  },
};
