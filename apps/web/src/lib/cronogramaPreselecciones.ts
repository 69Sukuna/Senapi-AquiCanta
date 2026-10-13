import type { DepartamentoValue } from './departamentos';

// Cronograma oficial de preselecciones presenciales departamentales 2026.
// `dias` en formato ISO (YYYY-MM-DD) para poder marcar en la página qué
// preselección ya pasó, cuál está en curso y cuál es la próxima.
export interface PreseleccionDepartamental {
  departamento: DepartamentoValue;
  fechaTexto: string;
  dias: string[];
  lugar: string;
  contacto: string;
}

export const CRONOGRAMA_PRESELECCIONES: PreseleccionDepartamental[] = [
  {
    departamento: 'CHUQUISACA',
    fechaTexto: '21 y 22 de octubre',
    dias: ['2026-10-21', '2026-10-22'],
    lugar: 'Centro Cultural Matilde Casazola',
    contacto: '57964090',
  },
  {
    departamento: 'ORURO',
    fechaTexto: '24 y 25 de octubre',
    dias: ['2026-10-24', '2026-10-25'],
    lugar: 'Súper Multiteatro',
    contacto: '73816398',
  },
  {
    departamento: 'TARIJA',
    fechaTexto: '26 y 27 de octubre',
    dias: ['2026-10-26', '2026-10-27'],
    lugar: 'Auditorio del Patio de Cabildo, Calle Sucre entre 15 de abril y Virginio Lema',
    contacto: '64300820',
  },
  {
    departamento: 'COCHABAMBA',
    fechaTexto: '27 y 28 de octubre',
    dias: ['2026-10-27', '2026-10-28'],
    lugar: 'Casa Departamental de Culturas',
    contacto: '71423756',
  },
  {
    departamento: 'LA_PAZ',
    fechaTexto: '29 y 30 de octubre',
    dias: ['2026-10-29', '2026-10-30'],
    lugar: 'Auditorio de la Casa de la Cultura',
    contacto: '64051281',
  },
  {
    departamento: 'SANTA_CRUZ',
    fechaTexto: '4 y 5 de noviembre',
    dias: ['2026-11-04', '2026-11-05'],
    lugar: 'Villa 1ro de Mayo',
    contacto: '69087013',
  },
  {
    departamento: 'POTOSI',
    fechaTexto: '6 y 7 de noviembre',
    dias: ['2026-11-06', '2026-11-07'],
    lugar: 'Llallagua – Teatro 31 de Octubre',
    contacto: '70466433',
  },
];
