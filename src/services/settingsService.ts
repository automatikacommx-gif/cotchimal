import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  CompanySettings, 
  WorkshopMachine, 
  MachineModel,
  PaperType, 
  WorkshopService, 
  ShippingZone, 
  OnboardingFullConfig,
  PriceScaleRange,
  WasteRange
} from '../types';
import { machinesCatalog } from '../data/machinesCatalog';

/**
 * Rangos de precio de escala predeterminados por volumen
 * según la referencia visual exacta (1-5 mill: $120, 6-15 mill: $100, 16-∞ mill: $80)
 */
export const DEFAULT_PRICE_SCALES: PriceScaleRange[] = [
  { id: 'scale-1', from_thousands: 1, to_thousands: 5, price_per_unit: 120 },
  { id: 'scale-2', from_thousands: 6, to_thousands: 15, price_per_unit: 100 },
  { id: 'scale-3', from_thousands: 16, to_thousands: null, price_per_unit: 80 },
];

/**
 * Rangos de merma predeterminados según la referencia visual exacta:
 * 100-500 plgs -> 200 plgs
 * 501-1000 plgs -> 300 plgs
 * 1001-5000 plgs -> 400 plgs
 * 5001-10000 plgs -> 700 plgs
 * 10001-∞ plgs -> 750 plgs
 */
export const DEFAULT_WASTE_RANGES: WasteRange[] = [
  { id: 'waste-1', from_sheets: 100, to_sheets: 500, waste_sheets: 200 },
  { id: 'waste-2', from_sheets: 501, to_sheets: 1000, waste_sheets: 300 },
  { id: 'waste-3', from_sheets: 1001, to_sheets: 5000, waste_sheets: 400 },
  { id: 'waste-4', from_sheets: 5001, to_sheets: 10000, waste_sheets: 700 },
  { id: 'waste-5', from_sheets: 10001, to_sheets: null, waste_sheets: 750 },
];

/**
 * Catálogo completo de máquinas predeterminadas
 * ordenadas estrictamente de la A a la Z según las especificaciones de las imágenes
 */
export const PRESET_MACHINE_MODELS: MachineModel[] = machinesCatalog;

export const DEFAULT_PRESET_MACHINES: Omit<WorkshopMachine, 'id'>[] = PRESET_MACHINE_MODELS.map((m) => ({
  name: m.name,
  tag: m.tag,
  max_width_cm: m.max_width_cm,
  max_height_cm: m.max_height_cm,
  max_calibre_pts: m.max_calibre_pts,
  gripper_margin_cm: m.gripper_margin_cm,
  counter_gripper_margin_cm: m.counter_gripper_margin_cm,
  guide_margin_cm: m.guide_margin_cm,
  counter_guide_margin_cm: m.counter_guide_margin_cm,
  useful_width_cm: m.useful_width_cm,
  useful_height_cm: m.useful_height_cm,
  sheet_size: `${m.max_width_cm}×${m.max_height_cm} cm`,
  plate_price: 80,
  pricing_mode: 'fixed',
  print_price_type: 'fijo',
  print_price: 80,
  print_price_fixed: 80,
  price_scales: [...DEFAULT_PRICE_SCALES],
  waste_ranges: '5 rangos · desde 100 plgs',
  waste_scales: [...DEFAULT_WASTE_RANGES],
  is_active: true,
  machine_type: m.technology.toLowerCase().includes('digital')
    ? 'digital'
    : m.technology.toLowerCase().includes('gran')
    ? 'gran_formato'
    : 'offset',
}));

export const INITIAL_PAPERS: PaperType[] = [
  {
    id: 'paper-bon',
    code: 'BON',
    name: 'Bond',
    description: 'Carta · libros · formularios',
    category: 'frecuente',
    selected: true,
    grammages: [],
  },
  {
    id: 'paper-cou',
    code: 'COU',
    name: 'Couché',
    description: 'Folletos · revistas · catálogos',
    category: 'frecuente',
    selected: true,
    grammages: [],
  },
  {
    id: 'paper-opa',
    code: 'OPA',
    name: 'Opalina',
    description: 'Tarjetas · invitaciones',
    category: 'frecuente',
    selected: true,
    grammages: [],
  },
  // 8 tipos comunes - Deseleccionados por defecto según guía exacta
  {
    id: 'paper-mic',
    code: 'MIC',
    name: 'Micro Flauta E',
    description: 'Display · empaque ligero',
    category: 'comun',
    selected: false,
    grammages: [],
  },
  {
    id: 'paper-cor',
    code: 'COR',
    name: 'Corrugado Flauta B',
    description: 'Cajas · industrial',
    category: 'comun',
    selected: false,
    grammages: [],
  },
  {
    id: 'paper-bri',
    code: 'BRI',
    name: 'Bristol',
    description: 'Tarjetas · carpetas rígidas',
    category: 'comun',
    selected: false,
    grammages: [],
  },
  {
    id: 'paper-adh',
    code: 'ADH',
    name: 'Autoadherible',
    description: 'Etiquetas · stickers',
    category: 'comun',
    selected: false,
    grammages: [],
  },
  {
    id: 'paper-acp',
    code: 'ACP',
    name: 'Autocopiable',
    description: 'Formatos · recibos NCR',
    category: 'comun',
    selected: false,
    grammages: [],
  },
  {
    id: 'paper-lkr',
    code: 'LKR',
    name: 'Linner Kraft',
    description: 'Forros · empaque corrugado',
    category: 'comun',
    selected: false,
    grammages: [],
  },
  {
    id: 'paper-mif',
    code: 'MIF',
    name: 'Micro Flauta F',
    description: 'Display · empaque ligero',
    category: 'comun',
    selected: false,
    grammages: [],
  },
  {
    id: 'paper-mul',
    code: 'MUL',
    name: 'Multicapa',
    description: 'Farmacéutico · premium',
    category: 'comun',
    selected: false,
    grammages: [],
  },
];

export const INITIAL_SERVICES: WorkshopService[] = [
  // Editorial
  { id: 'srv-comp', name: 'Compaginado', category: 'editorial', rate_mode: 'General', price: 0.10, unit: 'por pieza', is_selected: false },
  { id: 'srv-engr', name: 'Engrapado', category: 'editorial', rate_mode: 'General', price: 0.15, unit: 'por pieza', is_selected: false },
  { id: 'srv-pegr', name: 'Pegado rústico', category: 'editorial', rate_mode: 'General', price: 2.50, unit: 'por pieza', is_selected: false },

  // Empaque
  { id: 'srv-pegc', name: 'Pegado de caja', category: 'empaque', rate_mode: 'General', price: 0.50, unit: 'por pieza', is_selected: true },
  { id: 'srv-enco', name: 'Encolado', category: 'empaque', rate_mode: 'General', price: 0.30, unit: 'por pieza', is_selected: false },

  // Recubrimientos
  { id: 'srv-uvbr', name: 'Barniz UV Brillante', category: 'recubrimientos', rate_mode: 'General', price: 5.0, unit: 'por m²', is_selected: false },
  { id: 'srv-lamm', name: 'Laminado Mate', category: 'recubrimientos', rate_mode: 'General', price: 7.0, unit: 'por m²', min_price: 500, is_selected: true },
  { id: 'srv-bmaq', name: 'Barniz máquina', category: 'recubrimientos', rate_mode: 'General', price: 4.0, unit: 'por m²', is_selected: false },
  { id: 'srv-abrg', name: 'Arreglo de barniz a registro', category: 'recubrimientos', rate_mode: 'General', price: 250, unit: 'por proyecto', is_selected: false },
  { id: 'srv-apuv', name: 'Aplicación barniz registro UV Br.', category: 'recubrimientos', rate_mode: 'General', price: 8.0, unit: 'por m²', is_selected: false },
  { id: 'srv-plas', name: 'Plástico Brillante', category: 'recubrimientos', rate_mode: 'General', price: 6.0, unit: 'por m²', is_selected: false },
  { id: 'srv-uvmt', name: 'Barniz UV Mate', category: 'recubrimientos', rate_mode: 'General', price: 5.5, unit: 'por m²', is_selected: false },

  // Acabados
  { id: 'srv-dobl', name: 'Doblado', category: 'acabados', rate_mode: 'General', price: 80, unit: 'por millar', is_selected: true },
  { id: 'srv-plec', name: 'Plecado', category: 'acabados', rate_mode: 'General', price: 60, unit: 'por millar', is_selected: false },
  { id: 'srv-arsj', name: 'Arreglo de suajado', category: 'acabados', rate_mode: 'General', price: 300, unit: 'por proyecto', is_selected: false },
  { id: 'srv-suaj', name: 'Suajado', category: 'acabados', rate_mode: 'General', price: 90, unit: 'por millar', is_selected: false },
  { id: 'srv-smat', name: 'Suaje (matriz)', category: 'acabados', rate_mode: 'General', price: 450, unit: 'por proyecto', is_selected: false },
  { id: 'srv-foli', name: 'Foliado', category: 'acabados', rate_mode: 'General', price: 0.05, unit: 'por pieza', is_selected: true },
  { id: 'srv-desb', name: 'Desbarbado', category: 'acabados', rate_mode: 'General', price: 40, unit: 'por millar', is_selected: false },
  { id: 'srv-hots', name: 'Hot stamping', category: 'acabados', rate_mode: 'General', price: 15, unit: 'por m²', is_selected: false },
  { id: 'srv-reds', name: 'Redondeo de esquinas', category: 'acabados', rate_mode: 'General', price: 0.10, unit: 'por pieza', is_selected: false },
  { id: 'srv-engg', name: 'Engargolado', category: 'acabados', rate_mode: 'General', price: 8.0, unit: 'por pieza', is_selected: false },
  { id: 'srv-encd', name: 'Encuadernación', category: 'acabados', rate_mode: 'General', price: 12.0, unit: 'por pieza', is_selected: false },

  // Pre-prensa / Diseño
  { id: 'srv-disb', name: 'Diseño básico', category: 'preprensa', rate_mode: 'General', price: 350, unit: 'por proyecto', is_selected: true },
  { id: 'srv-artz', name: 'Arte desde cero', category: 'preprensa', rate_mode: 'General', price: 950, unit: 'por proyecto', is_selected: false },
  { id: 'srv-foto', name: 'Fotografía de producto', category: 'preprensa', rate_mode: 'General', price: 600, unit: 'por proyecto', is_selected: false },
  { id: 'srv-prub', name: 'Prueba de color certificada', category: 'preprensa', rate_mode: 'General', price: 120, unit: 'por proyecto', is_selected: false },
  { id: 'srv-reto', name: 'Retoque y salida CTP', category: 'preprensa', rate_mode: 'General', price: 200, unit: 'por proyecto', is_selected: false },
  { id: 'srv-ctpe', name: 'Placa CTP adicional', category: 'preprensa', rate_mode: 'General', price: 85, unit: 'por placa', is_selected: true },

  // Producción
  { id: 'srv-tiro-off', name: 'Tiraje Offset x Millar', category: 'produccion', rate_mode: 'General', price: 80, unit: 'por millar', is_selected: true },
  { id: 'srv-click-dig', name: 'Click Digital Color', category: 'produccion', rate_mode: 'General', price: 0.18, unit: 'por pieza', is_selected: true },
  { id: 'srv-gran-m2', name: 'Impresión Lona / Vinil x m²', category: 'produccion', rate_mode: 'General', price: 65, unit: 'por m²', is_selected: true },
  { id: 'srv-arr-maq', name: 'Arreglo / Montaje de máquina', category: 'produccion', rate_mode: 'General', price: 150, unit: 'por proyecto', is_selected: true },

  // Logística & Empaque
  { id: 'srv-emp-caja', name: 'Empaque en cajas corrugadas', category: 'logistica', rate_mode: 'General', price: 35, unit: 'por pieza', is_selected: true },
  { id: 'srv-emp-term', name: 'Termosellado / Emplayado', category: 'logistica', rate_mode: 'General', price: 15, unit: 'por lote', is_selected: true },
  { id: 'srv-env-loc', name: 'Envío local en camioneta', category: 'logistica', rate_mode: 'General', price: 250, unit: 'por envío', is_selected: true },
];

export const INITIAL_SHIPPING_ZONES: ShippingZone[] = [
  { id: 'zone-1', name: 'Zona A (Local / Taller)', price: 150, unit: '/proyecto' },
  { id: 'zone-2', name: 'Zona B (Periferia Industrial)', price: 300, unit: '/proyecto' },
  { id: 'zone-3', name: 'Zona C (Metropolitana / Foránea)', price: 600, unit: '/proyecto' },
];

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  contact_name: 'luis jimenez',
  company_name: 'editorial jimenez',
  city: 'Toluca',
  phone: '7226201052',
  email: '01luisenrique@gmail.com',
  rfc: '',
  accent_color: '#10B981',
  work_types: ['general'],
  press_cut_percent: 5,
  final_cut_price: 0.5,
  final_cut_mode: 'por_corte_millar',
};

const CONFIG_STORAGE_KEY = 'chimal_workshop_config_v3';

const loadCachedConfig = (): OnboardingFullConfig | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingFullConfig;
  } catch {
    return null;
  }
};

const saveCachedConfig = (cfg: OnboardingFullConfig) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    // ignore storage quota errors
  }
};

const cachedInitial = loadCachedConfig();

// Store en memoria con sincronización a localStorage y Supabase
let inMemoryConfig: OnboardingFullConfig = cachedInitial || {
  company: { ...INITIAL_COMPANY_SETTINGS },
  machines: [], // Estado inicial vacío según requerimiento estricto
  papers: [...INITIAL_PAPERS],
  services: [...INITIAL_SERVICES],
  shipping_zones: [...INITIAL_SHIPPING_ZONES],
};

export const settingsService = {
  /**
   * Obtiene la configuración completa de la empresa y taller
   */
  async getConfig(): Promise<OnboardingFullConfig> {
    const localSnapshot = loadCachedConfig();
    if (localSnapshot) {
      inMemoryConfig = localSnapshot;
    }

    if (isSupabaseConfigured()) {
      try {
        const { data: companyData } = await supabase
          .from('company_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (companyData) {
          inMemoryConfig.company = {
            ...inMemoryConfig.company,
            ...companyData,
          };
        }

        // Cargar máquinas configuradas en Supabase
        const { data: machinesData } = await supabase
          .from('workshop_machines')
          .select('*')
          .order('created_at', { ascending: true });

        if (machinesData && machinesData.length > 0) {
          inMemoryConfig.machines = machinesData
            .map((m) => ({
              id: m.id || `m-${m.name}`,
              name: m.name,
              tag: m.tag || '',
              max_width_cm: Number(m.max_width_cm) || 0,
              max_height_cm: Number(m.max_height_cm) || 0,
              max_calibre_pts: m.max_calibre_pts ? Number(m.max_calibre_pts) : undefined,
              gripper_margin_cm: Number(m.gripper_margin_cm) ?? 1,
              counter_gripper_margin_cm: Number(m.counter_gripper_margin_cm) ?? 1,
              guide_margin_cm: Number(m.guide_margin_cm) ?? 0.4,
              counter_guide_margin_cm: Number(m.counter_guide_margin_cm) ?? 0.4,
              useful_width_cm: Number(m.useful_width_cm) || 0,
              useful_height_cm: Number(m.useful_height_cm) || 0,
              sheet_size: m.sheet_size || `${m.max_width_cm}×${m.max_height_cm} cm`,
              plate_price: Number(m.plate_price) || 80,
              pricing_mode: m.pricing_mode || (m.print_price_type === 'escala' ? 'scale' : 'fixed'),
              print_price_type: m.print_price_type || 'fijo',
              print_price: Number(m.print_price) || 80,
              print_price_fixed: Number(m.print_price_fixed || m.print_price) || 80,
              price_scales: Array.isArray(m.price_scales) 
                ? m.price_scales 
                : (typeof m.price_scales === 'string' ? JSON.parse(m.price_scales) : [...DEFAULT_PRICE_SCALES]),
              waste_ranges: m.waste_ranges || '5 rangos · desde 100 plgs',
              waste_scales: Array.isArray(m.waste_scales)
                ? m.waste_scales
                : (typeof m.waste_scales === 'string' ? JSON.parse(m.waste_scales) : [...DEFAULT_WASTE_RANGES]),
              is_active: m.is_active ?? true,
              machine_type: m.machine_type || 'offset',
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
        }

        // Cargar catálogo de papeles desde Supabase y fusionar sin perder gramajes locales
        const { data: papersData } = await supabase
          .from('paper_catalog')
          .select('*')
          .order('created_at', { ascending: true });

        if (papersData && papersData.length > 0) {
          const dbPapers: PaperType[] = papersData.map((p) => {
            const parsedGrammages = Array.isArray(p.grammages)
              ? p.grammages
              : typeof p.grammages === 'string'
              ? JSON.parse(p.grammages)
              : [];

            // Buscar si en memoria/localStorage ya tenía gramajes configurados
            const localMatch = inMemoryConfig.papers.find(
              (lp) =>
                lp.code?.toUpperCase() === p.code?.toUpperCase() ||
                lp.name?.toLowerCase() === p.name?.toLowerCase()
            );

            const finalGrammages =
              parsedGrammages.length > 0
                ? parsedGrammages
                : localMatch?.grammages && localMatch.grammages.length > 0
                ? localMatch.grammages
                : [];

            return {
              id: p.id || localMatch?.id || `p-${p.code}`,
              code: p.code,
              name: p.name,
              description: p.description || localMatch?.description || '',
              category: (p.category || localMatch?.category || 'frecuente') as any,
              selected: p.is_active ?? localMatch?.selected ?? true,
              grammages: finalGrammages,
            };
          });

          // Conservar también papeles del catálogo base que aún no estén en la tabla de Supabase
          const mergedPapers = [...dbPapers];
          for (const baseP of inMemoryConfig.papers) {
            const exists = mergedPapers.some(
              (dp) =>
                dp.code?.toUpperCase() === baseP.code?.toUpperCase() ||
                dp.name?.toLowerCase() === baseP.name?.toLowerCase()
            );
            if (!exists) {
              mergedPapers.push(baseP);
            }
          }

          inMemoryConfig.papers = mergedPapers;
        }

        // Cargar servicios y acabados desde Supabase
        const { data: servicesData } = await supabase
          .from('workshop_services')
          .select('*')
          .order('created_at', { ascending: true });

        if (servicesData && servicesData.length > 0) {
          inMemoryConfig.services = servicesData.map((s) => ({
            id: s.id || `srv-${s.name}`,
            name: s.name,
            category: s.category as any,
            rate_mode: (s.rate_mode as any) || 'General',
            price: Number(s.price) || 0,
            unit: s.unit || 'por pieza',
            min_price: s.min_price ? Number(s.min_price) : undefined,
            is_selected: s.is_selected ?? true,
          }));
        }

        // Cargar zonas de envío desde Supabase
        const { data: shippingData } = await supabase
          .from('shipping_zones')
          .select('*')
          .order('created_at', { ascending: true });

        if (shippingData && shippingData.length > 0) {
          inMemoryConfig.shipping_zones = shippingData.map((z) => ({
            id: z.id || `zone-${z.name}`,
            name: z.name,
            price: Number(z.price) || 0,
            unit: z.unit || '/proyecto',
          }));
        }
      } catch (err) {
        console.warn('Usando configuración de taller local/fallback:', err);
      }
    }
    saveCachedConfig(inMemoryConfig);
    return inMemoryConfig;
  },

  /**
   * Guarda la configuración completa de los 5 pasos en Supabase y localStorage
   */
  async saveFullConfig(config: OnboardingFullConfig): Promise<{ success: boolean; error: string | null }> {
    inMemoryConfig = { ...config };
    saveCachedConfig(inMemoryConfig);

    if (isSupabaseConfigured()) {
      try {
        // 1. Guardar o actualizar datos de la empresa y parámetros del motor
        const payload = {
          contact_name: config.company.contact_name,
          company_name: config.company.company_name,
          city: config.company.city,
          phone: config.company.phone,
          email: config.company.email,
          rfc: config.company.rfc || '',
          logo_url: config.company.logo_url || '',
          letterhead_pdf_url: config.company.letterhead_pdf_url || '',
          accent_color: config.company.accent_color,
          referral_code: config.company.referral_code || '',
          work_types: config.company.work_types,
          press_cut_percent: config.company.press_cut_percent,
          final_cut_price: config.company.final_cut_price,
          final_cut_mode: config.company.final_cut_mode,
          updated_at: new Date().toISOString(),
        };

        const { error: companyError } = await supabase
          .from('company_settings')
          .upsert(payload, { onConflict: 'company_name' });

        if (companyError) {
          console.warn('Nota Supabase company_settings:', companyError.message);
        }

        // 2. Sincronizar máquinas en Supabase workshop_machines
        if (config.machines && config.machines.length > 0) {
          const { data: existingMachines } = await supabase
            .from('workshop_machines')
            .select('id, name');

          for (const m of config.machines) {
            const machineData: Record<string, any> = {
              name: m.name,
              sheet_size: m.sheet_size || `${m.max_width_cm}×${m.max_height_cm} cm`,
              plate_price: m.plate_price ?? 80,
              print_price_type: m.pricing_mode === 'scale' ? 'escala' : 'fijo',
              print_price: m.print_price_fixed ?? m.print_price ?? 80,
              waste_ranges: m.waste_ranges ?? '5 rangos · desde 100 plgs',
              is_active: m.is_active ?? true,
            };

            const existingM = (existingMachines || []).find(
              (em) => em.id === m.id || em.name?.toLowerCase() === m.name?.toLowerCase()
            );

            if (existingM?.id) {
              await supabase
                .from('workshop_machines')
                .update(machineData)
                .eq('id', existingM.id);
            } else {
              await supabase.from('workshop_machines').insert(machineData);
            }
          }
        }

        // 3. Sincronizar papeles en Supabase paper_catalog (Select + Update/Insert sin requerir UNIQUE en code)
        if (config.papers && config.papers.length > 0) {
          const { data: existingPapers } = await supabase
            .from('paper_catalog')
            .select('id, code, name');

          for (const p of config.papers) {
            const paperCode = p.code || p.name.slice(0, 5).toUpperCase();
            const paperData = {
              code: paperCode,
              name: p.name,
              description: p.description || '',
              category: p.category || 'frecuente',
              grammages: p.grammages || [],
              is_active: p.selected ?? true,
            };

            const existingP = (existingPapers || []).find(
              (ep) =>
                ep.id === p.id ||
                ep.code?.toUpperCase() === paperCode.toUpperCase() ||
                ep.name?.toLowerCase() === p.name?.toLowerCase()
            );

            if (existingP?.id) {
              await supabase
                .from('paper_catalog')
                .update(paperData)
                .eq('id', existingP.id);
            } else {
              await supabase.from('paper_catalog').insert(paperData);
            }
          }
        }

        // 4. Sincronizar servicios y acabados en Supabase workshop_services
        if (config.services && config.services.length > 0) {
          for (const s of config.services) {
            // Check if UUID or generate
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.id);
            const serviceData: Record<string, any> = {
              name: s.name,
              category: s.category,
              rate_mode: s.rate_mode,
              price: s.price,
              unit: s.unit,
              min_price: s.min_price || 0,
              is_selected: s.is_selected,
            };
            if (isUUID) {
              serviceData.id = s.id;
            }
            await supabase.from('workshop_services').upsert(serviceData, { onConflict: 'name' });
          }
        }

        // 5. Sincronizar zonas de envío en Supabase shipping_zones
        if (config.shipping_zones && config.shipping_zones.length > 0) {
          for (const z of config.shipping_zones) {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(z.id);
            const zoneData: Record<string, any> = {
              name: z.name,
              price: z.price,
              unit: z.unit,
            };
            if (isUUID) {
              zoneData.id = z.id;
            }
            await supabase.from('shipping_zones').upsert(zoneData, { onConflict: 'name' });
          }
        }
      } catch (err: any) {
        console.error('Error sincronizando configuración con Supabase:', err);
        return { success: true, error: null }; // Continúa con persistencia local
      }
    }

    return { success: true, error: null };
  },

  /**
   * Actualiza únicamente los datos generales de la empresa
   */
  async updateCompany(company: Partial<CompanySettings>): Promise<CompanySettings> {
    inMemoryConfig.company = {
      ...inMemoryConfig.company,
      ...company,
    };
    await this.saveFullConfig(inMemoryConfig);
    return inMemoryConfig.company;
  },

  /**
   * Actualiza la lista de máquinas del taller
   */
  async updateMachines(machines: WorkshopMachine[]): Promise<WorkshopMachine[]> {
    inMemoryConfig.machines = [...machines];
    await this.saveFullConfig(inMemoryConfig);
    return inMemoryConfig.machines;
  },

  /**
   * Actualiza el catálogo de papeles y gramajes
   */
  async updatePapers(papers: PaperType[]): Promise<PaperType[]> {
    inMemoryConfig.papers = [...papers];
    await this.saveFullConfig(inMemoryConfig);
    return inMemoryConfig.papers;
  },

  /**
   * Actualiza los servicios y tarifas
   */
  async updateServices(services: WorkshopService[]): Promise<WorkshopService[]> {
    inMemoryConfig.services = [...services];
    await this.saveFullConfig(inMemoryConfig);
    return inMemoryConfig.services;
  },

  /**
   * Guarda o actualiza un servicio individual con toda su parametrización en Supabase y memoria
   */
  async saveSingleService(service: WorkshopService): Promise<WorkshopService> {
    const idx = inMemoryConfig.services.findIndex((s) => s.id === service.id || s.name === service.name);
    if (idx >= 0) {
      inMemoryConfig.services[idx] = { ...service };
    } else {
      inMemoryConfig.services.push({ ...service });
    }

    if (isSupabaseConfigured()) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(service.id);
        const payload: Record<string, any> = {
          name: service.name,
          category: service.category,
          rate_mode: service.rate_mode || (service.pricing_mode === 'escala' ? 'Por escala' : 'General'),
          price: service.price,
          unit: service.unit,
          min_price: service.min_price || 0,
          is_selected: service.is_selected ?? true,
        };
        if (isUUID) {
          payload.id = service.id;
        }
        const { error } = await supabase
          .from('workshop_services')
          .upsert(payload, { onConflict: 'name' });
        if (error) {
          console.warn('Nota de sincronización Supabase en servicio individual:', error.message);
        }
      } catch (err) {
        console.warn('Error al persistir servicio en Supabase:', err);
      }
    }

    return service;
  },

  /**
   * Guarda o actualiza una máquina individual en Supabase y memoria
   */
  async saveSingleMachine(machine: WorkshopMachine): Promise<WorkshopMachine> {
    const idx = inMemoryConfig.machines.findIndex((m) => m.id === machine.id || m.name === machine.name);
    if (idx >= 0) {
      inMemoryConfig.machines[idx] = { ...machine };
    } else {
      inMemoryConfig.machines.push({ ...machine });
    }

    if (isSupabaseConfigured()) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(machine.id);
        const machineData: Record<string, any> = {
          name: machine.name,
          tag: machine.tag || '',
          max_width_cm: machine.max_width_cm,
          max_height_cm: machine.max_height_cm,
          max_calibre_pts: machine.max_calibre_pts,
          gripper_margin_cm: machine.gripper_margin_cm,
          counter_gripper_margin_cm: machine.counter_gripper_margin_cm,
          guide_margin_cm: machine.guide_margin_cm,
          counter_guide_margin_cm: machine.counter_guide_margin_cm,
          useful_width_cm: machine.useful_width_cm,
          useful_height_cm: machine.useful_height_cm,
          sheet_size: machine.sheet_size || `${machine.max_width_cm}×${machine.max_height_cm} cm`,
          plate_price: machine.plate_price ?? 80,
          print_price_type: machine.pricing_mode === 'scale' ? 'escala' : 'fijo',
          print_price: machine.print_price_fixed ?? machine.print_price ?? 80,
          price_scales: machine.price_scales ?? DEFAULT_PRICE_SCALES,
          waste_ranges: machine.waste_ranges ?? '5 rangos · desde 100 plgs',
          waste_scales: machine.waste_scales ?? DEFAULT_WASTE_RANGES,
          is_active: machine.is_active ?? true,
        };
        if (isUUID) {
          machineData.id = machine.id;
        }
        const { error } = await supabase
          .from('workshop_machines')
          .upsert(machineData, { onConflict: 'name' });
        if (error) {
          console.warn('Nota de sincronización Supabase en máquina individual:', error.message);
        }
      } catch (err) {
        console.warn('Error al persistir máquina en Supabase:', err);
      }
    }

    return machine;
  },

  /**
   * Actualiza las zonas de envío y logística
   */
  async updateShippingZones(zones: ShippingZone[]): Promise<ShippingZone[]> {
    inMemoryConfig.shipping_zones = [...zones];
    await this.saveFullConfig(inMemoryConfig);
    return inMemoryConfig.shipping_zones;
  },
};
