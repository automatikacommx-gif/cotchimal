import { PricingMode, PriceScaleRange, WasteRange } from './index';

export interface MachineModel {
  id: string;
  name: string;
  brand: string;
  technology: 'Offset' | 'Digital' | 'Gran Formato' | string;
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

export interface WorkshopMachine {
  id: string;
  name: string; // Nombre / Modelo
  tag?: string; // Tag / Descripción opcional
  brand?: string;
  technology?: string;
  max_width_cm?: number; // Tam. Máx. Ancho (cm)
  max_height_cm?: number; // Tam. Máx. Alto (cm)
  max_calibre_pts?: number | string; // Calibre máximo opcional (pts)
  gripper_margin_cm?: number; // Pinza (cm)
  counter_gripper_margin_cm?: number; // Contra-pinza (cm)
  guide_margin_cm?: number; // Escuadra (cm)
  counter_guide_margin_cm?: number; // Contra-escuadra (cm)
  useful_width_cm?: number; // Área útil ancho calculada (cm)
  useful_height_cm?: number; // Área útil alto calculada (cm)
  sheet_size: string; // ej: '75×53 cm'
  colors?: string;
  speed?: string;
  plate_price?: number; // Láminas CMYK o preparación
  pricing_mode?: PricingMode; // 'fixed' | 'scale'
  print_price_type?: 'fijo' | 'escala' | 'metro';
  print_price?: number; // $/color x millar
  print_price_fixed?: number;
  price_scales?: PriceScaleRange[];
  waste_ranges?: string;
  waste_scales?: WasteRange[];
  is_active?: boolean;
  machine_type?: 'offset' | 'digital' | 'gran_formato';
}
