/**
 * Definición de tipos de TypeScript para el sistema de Cotizaciones y CRM
 * Compatible con el esquema relacional de Supabase (PostgreSQL)
 */

export type UserRole = 'admin' | 'seller' | 'vendedor' | 'dueño' | 'miembro';

export interface SectionPermissions {
  resumen: 'sin_acceso' | 'lectura' | 'edicion';
  cotizar: 'sin_acceso' | 'acceso';
  clientes: 'sin_acceso' | 'lectura' | 'edicion';
  tarifario: 'sin_acceso' | 'lectura' | 'edicion';
  prensas: 'sin_acceso' | 'lectura' | 'edicion';
  papeles: 'sin_acceso' | 'lectura' | 'edicion';
}

export interface TeamMember {
  id: string;
  user_id?: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_owner?: boolean;
  role_label?: string;
  access_label?: string;
  permissions?: SectionPermissions;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface LargeFormatConfig {
  substrate: string;
  width_m: number;
  height_m: number;
  square_meters: number;
  quantity: number;
  dpi: '720' | '1440' | '2880';
  ink_type: 'eco_solvente' | 'solvente' | 'uv' | 'latex';
  finishes: string[];
  waste_percent: number;
  notes?: string;
}

export type ClientCategory = 'Editorial' | 'Automotriz' | 'Corporativo' | 'Publicidad' | 'PyME';

export interface Client {
  id: string;
  user_id?: string;
  business_name: string;
  rfc: string;
  contact_name: string;
  contact_role: string;
  email: string;
  phone: string;
  address: string;
  category: ClientCategory;
  tags: string[];
  notes: string;
  cfdi_use?: string;
  tax_regime?: string;
  total_billed?: number;
  quotes_count?: number;
  created_at: string;
  updated_at: string;
}

export type ProjectType = 'general' | 'editorial' | 'empaque' | 'gran_formato';

export type QuoteStatus = 'borrador' | 'enviada' | 'negociacion' | 'aceptada' | 'rechazada';

export interface QuoteItem {
  id?: string;
  quote_id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  substrate_finishing?: string;
  subtotal: number;
}

export interface QuoteOptionalFields {
  material?: string;
  observations?: string;
}

export interface Quote {
  id: string;
  user_id?: string;
  quote_number: string;
  client_id: string;
  project_title: string;
  project_type: ProjectType;
  status: QuoteStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  valid_until: string;
  technical_notes?: string;
  material?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  items?: QuoteItem[];
}

export interface TrackingCommitment {
  id: string;
  quote_id?: string;
  quote_number?: string;
  client_name: string;
  description: string;
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
  due_date_label: string;
  phone?: string;
  completed: boolean;
  action_type?: 'call' | 'whatsapp' | 'file';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
}

// ==========================================
// TIPOS PARA ONBOARDING / AJUSTES (EMPRESA)
// ==========================================

export interface CompanySettings {
  id?: string;
  user_id?: string;
  contact_name: string;
  company_name: string;
  city: string;
  phone: string;
  email: string;
  rfc?: string;
  logo_url?: string;
  letterhead_pdf_url?: string; // Papelería tamaño carta (PDF membretado)
  accent_color: string;
  referral_code?: string;
  work_types: ('general' | 'editorial' | 'empaque' | 'gran_formato')[];
  press_cut_percent: number;
  final_cut_price: number;
  final_cut_mode: 'por_corte_millar' | 'por_proyecto';
  created_at?: string;
  updated_at?: string;
}

export interface CostParameters {
  press_cut_percent: number;
  final_cut_price: number;
  final_cut_mode: 'por_corte_millar' | 'por_proyecto';
}

export interface MachineModel {
  id: string;
  name: string;
  brand: string;
  technology: string;
  tag?: string;
  max_width_cm: number;
  max_height_cm: number;
  max_calibre_pts?: number;
  gripper_margin_cm: number;
  counter_gripper_margin_cm: number;
  guide_margin_cm: number;
  counter_guide_margin_cm: number;
  useful_width_cm: number;
  useful_height_cm: number;
  useful_area_label: string;
}

export type PricingMode = 'fixed' | 'scale';

export interface PriceScaleRange {
  id?: string;
  from_thousands?: number;
  to_thousands?: number | null; // null representa infinito (∞)
  from_sheets?: number;
  to_sheets?: number | null;
  price_per_unit: number; // $/color x millar
}

export interface WasteRange {
  id: string;
  from_sheets: number; // Desde (plgs)
  to_sheets: number | null; // Hasta (plgs) - null representa ∞
  waste_sheets?: number; // Merma (plgs)
  setup_sheets?: number;
  run_percent?: number;
}

export interface WasteConfig {
  ranges: WasteRange[];
}

export interface MachineConfig {
  id: string;
  name: string;
  tag?: string;
  max_width_cm: number;
  max_height_cm: number;
  max_calibre_pts?: number | string;
  gripper_margin_cm: number;
  counter_gripper_margin_cm: number;
  guide_margin_cm: number;
  counter_guide_margin_cm: number;
  useful_width_cm?: number;
  useful_height_cm?: number;
  sheet_size: string;
  plate_price: number;
  pricing_mode: PricingMode;
  print_price_fixed: number;
  price_scales: PriceScaleRange[];
  waste_ranges?: string;
  waste_scales?: WasteRange[];
  is_active?: boolean;
}

export interface WorkshopMachine {
  id: string;
  name: string; // Nombre / Modelo
  tag?: string; // Tag / Descripción opcional (ej: "Chica, Gran formato")
  max_width_cm?: number; // Tam. Máx. Ancho (cm)
  max_height_cm?: number; // Tam. Máx. Alto (cm)
  max_calibre_pts?: number | string; // Calibre máximo opcional (pts)
  gripper_margin_cm?: number; // Pinza (cm)
  counter_gripper_margin_cm?: number; // Contra-pinza (cm)
  guide_margin_cm?: number; // Escuadra (cm)
  counter_guide_margin_cm?: number; // Contra-escuadra (cm)
  useful_width_cm?: number; // Área útil ancho calculada (cm)
  useful_height_cm?: number; // Área útil alto calculada (cm)
  sheet_size: string; // ej: '35×50 cm'
  colors?: string; // ej: '4 a 8 Colores CMYK'
  speed?: string; // ej: '18,000 pliegos/h'
  plate_price?: number; // LAMINAS CMYK o preparación (default: 80)
  pricing_mode?: PricingMode; // 'fixed' | 'scale'
  print_price_type?: 'fijo' | 'escala' | 'metro';
  print_price?: number; // por color x millar (modo fijo)
  print_price_fixed?: number;
  price_scales?: PriceScaleRange[];
  waste_ranges?: string; // mermas resumen
  waste_scales?: WasteRange[]; // mermas por rango exacto
  is_active?: boolean;
  machine_type?: 'offset' | 'digital' | 'gran_formato';
}

export type PaperCategory = 'frecuente' | 'comun' | 'personalizado';

export type PaperFamily = 'bond' | 'couche' | 'opalina' | string;

export interface GrammageConfig {
  id?: string;
  grammage: number;
  width_cm: number;
  height_cm: number;
  kg_per_thousand: number;
  suggested_price: number;
  user_price?: number;
  material?: string;
  observations?: string;
  is_added?: boolean;
}

export interface PaperPriceConfig {
  width_cm: number;
  height_cm: number;
  kg_per_thousand: number;
  suggested_price: number;
  user_price?: number;
  is_active?: boolean;
}

export interface PaperGrammage {
  id?: string;
  grammage: number | string; // en g (ej: 70, 75, 90, 120, 300) o calibre (ej: "14pts", "13oz")
  width_cm?: number; // ej: 58
  height_cm?: number; // ej: 88
  sheet_size?: string; // ej: "70×100 cm" o "1.60m bobina"
  price_per_thousand: number; // ej: 1000 / millar o $/m2
  material?: string;
  notes?: string;
}

export interface PaperType {
  id: string;
  code: string; // BON, COU, OPA, etc.
  name: string;
  description: string;
  category?: PaperCategory;
  selected: boolean;
  grammages: PaperGrammage[];
}

export type PriceUnit =
  | 'Por pieza'
  | 'Por millar'
  | 'Por proyecto'
  | 'Por pliego'
  | 'Por metro cuadrado'
  | 'Por lado, por millar'
  | '% sobre el papel'
  | 'Por lámina (una vez)'
  | 'Por color, por millar'
  | 'Por corte, por millar'
  | 'Por toma';

export interface ServiceScaleRange {
  id: string;
  from: number;
  to: number | null; // null representa infinito (∞)
  price: number;
}

export interface WorkshopService {
  id: string;
  name: string;
  category: 'editorial' | 'empaque' | 'recubrimientos' | 'acabados' | 'preprensa' | 'produccion' | 'logistica';
  description?: string;
  rate_mode: string; // ej: "General" o "Por escala"
  pricing_mode?: 'fijo' | 'escala';
  price: number;
  unit: string; // ej: "Por metro cuadrado", "Por millar", etc.
  min_price?: number;
  has_minimum_charge?: boolean;
  price_scales?: ServiceScaleRange[];
  is_selected: boolean;
}

export interface ShippingZone {
  id: string;
  name: string;
  price: number;
  unit: string; // ej: "/proyecto", "/envío"
}

export interface OnboardingFullConfig {
  company: CompanySettings;
  machines: WorkshopMachine[];
  papers: PaperType[];
  services: WorkshopService[];
  shipping_zones: ShippingZone[];
}

