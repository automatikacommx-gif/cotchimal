import React from 'react';
import { Step3Machines as Step3MachinesComponent } from '../settings/onboarding/Step3Machines';
import { WorkshopMachine, CompanySettings } from '../../types';

export interface MachineCatalogItem {
  id: string;
  name: string;
  nombre: string;
  brand: string;
  technology: string;
  tag: string;
  max_width_cm: number;
  max_height_cm: number;
  max_calibre_pts: number;
  gripper_margin_cm: number;
  counter_gripper_margin_cm: number;
  guide_margin_cm: number;
  counter_guide_margin_cm: number;
  useful_width_cm: number;
  useful_height_cm: number;
  useful_area_label: string;
}

/**
 * Catálogo e inventario de máquinas extraídas única y exclusivamente
 * de las 10 imágenes técnicas de referencia provistas por el usuario:
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
export const RAW_MACHINES = [
  {
    id: 'preset-konica-minolta-accuriojet-km-1e',
    name: 'Konica Minolta AccurioJet KM-1e',
    nombre: 'Konica Minolta AccurioJet KM-1e',
    brand: 'Konica Minolta',
    technology: 'Digital',
    tag: 'Konica Minolta · Digital · 58.5×75 cm · 24 pts',
    max_width_cm: 58.5,
    max_height_cm: 75,
    max_calibre_pts: 24,
    gripper_margin_cm: 0.2,
    counter_gripper_margin_cm: 0.2,
    guide_margin_cm: 0.2,
    counter_guide_margin_cm: 0.2,
    useful_width_cm: 58.1,
    useful_height_cm: 74.6,
    useful_area_label: '58.1×74.6 cm',
  },
  {
    id: 'preset-konica-minolta-accuriolabel-230',
    name: 'Konica Minolta AccurioLabel 230',
    nombre: 'Konica Minolta AccurioLabel 230',
    brand: 'Konica Minolta',
    technology: 'Digital',
    tag: 'Konica Minolta · Digital · 33×120 cm · 10 pts',
    max_width_cm: 33,
    max_height_cm: 120,
    max_calibre_pts: 10,
    gripper_margin_cm: 0.3,
    counter_gripper_margin_cm: 0.3,
    guide_margin_cm: 0.3,
    counter_guide_margin_cm: 0.3,
    useful_width_cm: 32.4,
    useful_height_cm: 119.4,
    useful_area_label: '32.4×119.4 cm',
  },
  {
    id: 'preset-konica-minolta-accuriopress-6136',
    name: 'Konica Minolta AccurioPress 6136',
    nombre: 'Konica Minolta AccurioPress 6136',
    brand: 'Konica Minolta',
    technology: 'Digital',
    tag: 'Konica Minolta · Digital · 32.4×48.3 cm · 14 pts',
    max_width_cm: 32.4,
    max_height_cm: 48.3,
    max_calibre_pts: 14,
    gripper_margin_cm: 0.4,
    counter_gripper_margin_cm: 0.4,
    guide_margin_cm: 0.4,
    counter_guide_margin_cm: 0.4,
    useful_width_cm: 31.6,
    useful_height_cm: 47.5,
    useful_area_label: '31.6×47.5 cm',
  },
  {
    id: 'preset-konica-minolta-accuriopress-c14000',
    name: 'Konica Minolta AccurioPress C14000',
    nombre: 'Konica Minolta AccurioPress C14000',
    brand: 'Konica Minolta',
    technology: 'Digital',
    tag: 'Konica Minolta · Digital · 33×48.7 cm · 18 pts',
    max_width_cm: 33,
    max_height_cm: 48.7,
    max_calibre_pts: 18,
    gripper_margin_cm: 0.4,
    counter_gripper_margin_cm: 0.4,
    guide_margin_cm: 0.4,
    counter_guide_margin_cm: 0.4,
    useful_width_cm: 32.2,
    useful_height_cm: 47.9,
    useful_area_label: '32.2×47.9 cm',
  },
  {
    id: 'preset-konica-minolta-accuriopress-c3070',
    name: 'Konica Minolta AccurioPress C3070',
    nombre: 'Konica Minolta AccurioPress C3070',
    brand: 'Konica Minolta',
    technology: 'Digital',
    tag: 'Konica Minolta · Digital · 33×48.7 cm · 14 pts',
    max_width_cm: 33,
    max_height_cm: 48.7,
    max_calibre_pts: 14,
    gripper_margin_cm: 0.4,
    counter_gripper_margin_cm: 0.4,
    guide_margin_cm: 0.4,
    counter_guide_margin_cm: 0.4,
    useful_width_cm: 32.2,
    useful_height_cm: 47.9,
    useful_area_label: '32.2×47.9 cm',
  },
  {
    id: 'preset-konica-minolta-accuriopress-c4080',
    name: 'Konica Minolta AccurioPress C4080',
    nombre: 'Konica Minolta AccurioPress C4080',
    brand: 'Konica Minolta',
    technology: 'Digital',
    tag: 'Konica Minolta · Digital · 33×48.7 cm · 14 pts',
    max_width_cm: 33,
    max_height_cm: 48.7,
    max_calibre_pts: 14,
    gripper_margin_cm: 0.4,
    counter_gripper_margin_cm: 0.4,
    guide_margin_cm: 0.4,
    counter_guide_margin_cm: 0.4,
    useful_width_cm: 32.2,
    useful_height_cm: 47.9,
    useful_area_label: '32.2×47.9 cm',
  },
  {
    id: 'preset-konica-minolta-accuriopress-c7100',
    name: 'Konica Minolta AccurioPress C7100',
    nombre: 'Konica Minolta AccurioPress C7100',
    brand: 'Konica Minolta',
    technology: 'Digital',
    tag: 'Konica Minolta · Digital · 33×48.7 cm · 16 pts',
    max_width_cm: 33,
    max_height_cm: 48.7,
    max_calibre_pts: 16,
    gripper_margin_cm: 0.4,
    counter_gripper_margin_cm: 0.4,
    guide_margin_cm: 0.4,
    counter_guide_margin_cm: 0.4,
    useful_width_cm: 32.2,
    useful_height_cm: 47.9,
    useful_area_label: '32.2×47.9 cm',
  },
  {
    id: 'preset-konica-minolta-bizhub-pro-1100',
    name: 'Konica Minolta bizhub PRO 1100',
    nombre: 'Konica Minolta bizhub PRO 1100',
    brand: 'Konica Minolta',
    technology: 'Digital',
    tag: 'Konica Minolta · Digital · 32.4×46.3 cm · 12 pts',
    max_width_cm: 32.4,
    max_height_cm: 46.3,
    max_calibre_pts: 12,
    gripper_margin_cm: 0.4,
    counter_gripper_margin_cm: 0.4,
    guide_margin_cm: 0.4,
    counter_guide_margin_cm: 0.4,
    useful_width_cm: 31.6,
    useful_height_cm: 45.5,
    useful_area_label: '31.6×45.5 cm',
  },
  {
    id: 'preset-kyocera-taskalfa-pro-15000c',
    name: 'Kyocera TASKalfa Pro 15000c',
    nombre: 'Kyocera TASKalfa Pro 15000c',
    brand: 'Kyocera',
    technology: 'Digital',
    tag: 'Kyocera · Digital · 33×48.8 cm · 14 pts',
    max_width_cm: 33,
    max_height_cm: 48.8,
    max_calibre_pts: 14,
    gripper_margin_cm: 0.4,
    counter_gripper_margin_cm: 0.4,
    guide_margin_cm: 0.4,
    counter_guide_margin_cm: 0.4,
    useful_width_cm: 32.2,
    useful_height_cm: 48,
    useful_area_label: '32.2×48 cm',
  },
  {
    id: 'preset-landa-landa-s10',
    name: 'Landa Landa S10',
    nombre: 'Landa Landa S10',
    brand: 'Landa',
    technology: 'Digital',
    tag: 'Landa · Digital · 75×105 cm · 24 pts',
    max_width_cm: 75,
    max_height_cm: 105,
    max_calibre_pts: 24,
    gripper_margin_cm: 0.3,
    counter_gripper_margin_cm: 0.3,
    guide_margin_cm: 0.3,
    counter_guide_margin_cm: 0.3,
    useful_width_cm: 74.4,
    useful_height_cm: 104.4,
    useful_area_label: '74.4×104.4 cm',
  },
];

/**
 * Lista de máquinas estrictamente ordenada de la A a la Z
 * mediante `.sort((a, b) => a.nombre.localeCompare(b.nombre))`
 */
export const MACHINES = [...RAW_MACHINES].sort((a, b) => a.nombre.localeCompare(b.nombre));
export const machines = MACHINES;
export const WIZARD_MACHINES_CATALOG = MACHINES;
export const WIZARD_REFERENCE_MACHINES = MACHINES;

export interface Step3MachinesProps {
  machines: WorkshopMachine[];
  company: CompanySettings;
  onUpdateMachines: (machines: WorkshopMachine[]) => void;
  onUpdateCompany: (company: Partial<CompanySettings>) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step3Machines: React.FC<Step3MachinesProps> = (props) => {
  return <Step3MachinesComponent {...props} />;
};

export default Step3Machines;
