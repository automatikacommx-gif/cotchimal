import { MachineModel, WorkshopMachine } from '../types/machines';
import { machinesCatalog } from './machinesCatalog';

/**
 * Catálogo e inventario de máquinas de referencia derivado única y exclusivamente
 * de las 10 imágenes de referencia provistas, ordenadas alfabéticamente A-Z:
 * 1. Konica Minolta AccurioJet KM-1e
 * 2. Konica Minolta AccurioLabel 230
 * 3. Konica Minolta AccurioPress 6136
 * 4. Konica Minolta AccurioPress C14000
 * 5. Konica Minolta AccurioPress C3070
 * 6. Konica Minolta AccurioPress C4080
 * 7. Konica Minolta AccurioPress C7100
 * 8. Konica Minolta bizhub PRO 1100
 * 9. Kyocera TASKalfa Pro 15000c
 * 10. Landa Landa S10
 */
export const REFERENCE_MACHINES: MachineModel[] = machinesCatalog.map((m) => ({
  id: m.id,
  name: m.name,
  brand: m.brand,
  technology: m.technology,
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
  useful_area_label: m.useful_area_label,
}));

export { machinesCatalog };

export const createWorkshopMachineFromPreset = (preset: MachineModel): WorkshopMachine => ({
  id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
  name: preset.name,
  tag: preset.tag || '',
  brand: preset.brand,
  technology: preset.technology,
  max_width_cm: preset.max_width_cm,
  max_height_cm: preset.max_height_cm,
  max_calibre_pts: preset.max_calibre_pts,
  gripper_margin_cm: preset.gripper_margin_cm,
  counter_gripper_margin_cm: preset.counter_gripper_margin_cm,
  guide_margin_cm: preset.guide_margin_cm,
  counter_guide_margin_cm: preset.counter_guide_margin_cm,
  useful_width_cm: preset.useful_width_cm,
  useful_height_cm: preset.useful_height_cm,
  sheet_size: `${preset.max_width_cm}×${preset.max_height_cm} cm`,
  plate_price: 80,
  pricing_mode: 'fixed',
  print_price_type: 'fijo',
  print_price: 80,
  print_price_fixed: 80,
  price_scales: [
    { id: 'scale-1', from_thousands: 1, to_thousands: 5, price_per_unit: 80 },
    { id: 'scale-2', from_thousands: 6, to_thousands: 10, price_per_unit: 75 },
    { id: 'scale-3', from_thousands: 11, to_thousands: 20, price_per_unit: 70 },
    { id: 'scale-4', from_thousands: 21, to_thousands: null, price_per_unit: 65 },
  ],
  waste_ranges: '5 rangos · desde 100 plgs',
  waste_scales: [
    { id: 'waste-1', from_sheets: 100, to_sheets: 500, waste_sheets: 200 },
    { id: 'waste-2', from_sheets: 501, to_sheets: 1000, waste_sheets: 300 },
    { id: 'waste-3', from_sheets: 1001, to_sheets: 5000, waste_sheets: 400 },
    { id: 'waste-4', from_sheets: 5001, to_sheets: 10000, waste_sheets: 700 },
    { id: 'waste-5', from_sheets: 10001, to_sheets: null, waste_sheets: 750 },
  ],
  is_active: true,
  machine_type: preset.technology.toLowerCase().includes('digital') ? 'digital' : 'offset',
});
