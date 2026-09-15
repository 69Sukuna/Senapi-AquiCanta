// Contenido del popup de detalle de categoría (/categorias). Fuente: "CONVOCATORIA
// oficial fondo blanco 2026.docx" — sección "REQUISITOS POR CATEGORÍA", la tabla
// de "PARÁMETROS DE CALIFICACIÓN" y la tabla de premios ("DE LOS PREMIOS").
// Los datos numéricos que ya existen en lib/categorias.ts (edad, integrantes,
// acompañantes, duración) no se repiten acá — el modal los combina con esto.
export interface CriterioCalificacion {
  label: string;
  porcentaje: number;
}

export interface ConvocatoriaCategoria {
  // Aclaración corta solo para las categorías cuyo nombre no es autoexplicativo
  // (qué es un instrumento "armónico" vs. "melódico", etc.).
  descripcion?: string;
  instrumentosPermitidos: string[];
  instrumentosNoPermitidos: string[];
  documentacion: string[];
  criterios: CriterioCalificacion[];
  premio: string;
}

const DOC_BASE = 'Nota de declaración voluntaria de que no es músico profesional (Anexo 3)';
const DOC_BASE_SIN_PROFESIONAL = 'Nota de declaración voluntaria (Anexo 3)';
const DOC_CI = (quienes: string) => `2 fotocopias de cédula de identidad vigente ${quienes}`;
const DOC_CARTA = 'Carta de presentación con datos personales e instrumentos a interpretar (Anexo 2)';
const DOC_AUTORIZACION_ADULTO = 'Carta de autorización del adulto responsable — padre, madre o tutor legal (Anexo 4)';

const NO_TECLADOS = 'Teclados, pedales, secuenciadores, samplers u otros efectos que alteren la interpretación';

export const CONVOCATORIA_CATEGORIAS: Record<string, ConvocatoriaCategoria> = {
  Ñusta: {
    descripcion:
      'Categoría que busca promover nuevos valores del ámbito artístico — se evalúa calidad interpretativa, no la cantidad de instrumentos.',
    instrumentosPermitidos: ['Mínimo 3 instrumentos de familias distintas (aerófonos, cordófonos, membranófonos, idiófonos, etc.)'],
    instrumentosNoPermitidos: [],
    documentacion: [
      DOC_CARTA,
      DOC_CI('de la postulante'),
      DOC_BASE_SIN_PROFESIONAL + ' de que no es música profesional',
      'Plan de promoción del festival a ejecutar en caso de ser coronada',
      DOC_AUTORIZACION_ADULTO + ' (si es menor de edad)',
    ],
    criterios: [
      { label: 'Interpretación instrumental', porcentaje: 40 },
      { label: 'Interpretación vocal', porcentaje: 30 },
      { label: 'Carisma, dominio de escenario y conocimientos culturales', porcentaje: 15 },
      { label: 'Indumentaria representativa del lugar de origen', porcentaje: 15 },
    ],
    premio: 'Bs. 7.000 (premio único)',
  },

  'Solista vocal': {
    instrumentosPermitidos: ['Batería (percusión)', 'Bajo eléctrico'],
    instrumentosNoPermitidos: [NO_TECLADOS, 'Pistas instrumentales de acompañamiento (karaoke)'],
    documentacion: [DOC_CARTA, DOC_CI('del postulante y de cada acompañante musical'), DOC_BASE],
    criterios: [
      { label: 'Interpretación', porcentaje: 40 },
      { label: 'Técnica vocal', porcentaje: 30 },
      { label: 'Expresión y dominio de escenario', porcentaje: 20 },
      { label: 'Indumentaria', porcentaje: 10 },
    ],
    premio: 'Oro Bs. 6.000 · Plata Bs. 4.000 · Bronce Bs. 2.000',
  },

  'Solista instrumental – Armónico': {
    descripcion:
      'Un instrumento "armónico" interpreta melodía y acompañamiento a la vez (ej. guitarra, charango) — no admite músicos de acompañamiento.',
    instrumentosPermitidos: [],
    instrumentosNoPermitidos: [NO_TECLADOS],
    documentacion: [DOC_CARTA, DOC_CI('del postulante'), DOC_BASE],
    criterios: [
      { label: 'Dominio instrumental', porcentaje: 50 },
      { label: 'Interpretación y expresión', porcentaje: 30 },
      { label: 'Indumentaria', porcentaje: 20 },
    ],
    premio: 'Oro Bs. 3.000 · Plata Bs. 2.000 · Bronce Bs. 1.000',
  },

  'Solista instrumental – Melódico': {
    descripcion:
      'Un instrumento "melódico" interpreta una sola nota a la vez (ej. quena, zampoña, violín), sonando similar a una voz cantando.',
    instrumentosPermitidos: [],
    instrumentosNoPermitidos: ['Batería (percusión)', 'Bajo eléctrico', NO_TECLADOS],
    documentacion: [DOC_CARTA, DOC_CI('del postulante y del acompañante, si tiene uno'), DOC_BASE],
    criterios: [
      { label: 'Dominio instrumental', porcentaje: 50 },
      { label: 'Interpretación y expresión', porcentaje: 30 },
      { label: 'Indumentaria', porcentaje: 20 },
    ],
    premio: 'Oro Bs. 3.000 · Plata Bs. 2.000 · Bronce Bs. 1.000',
  },

  'Dúo vocal instrumental': {
    descripcion: 'Ambos integrantes cantan a dos voces y ejecutan un instrumento de forma simultánea durante todo el tema.',
    instrumentosPermitidos: [],
    instrumentosNoPermitidos: ['Batería (percusión)', 'Bajo eléctrico', NO_TECLADOS],
    documentacion: [DOC_CARTA, DOC_CI('de cada integrante'), DOC_BASE],
    criterios: [
      { label: 'Interpretación vocal y armonía', porcentaje: 30 },
      { label: 'Interpretación instrumental', porcentaje: 30 },
      { label: 'Expresión y dominio de escenario', porcentaje: 25 },
      { label: 'Indumentaria', porcentaje: 15 },
    ],
    premio: 'Oro Bs. 8.000 · Plata Bs. 5.000 · Bronce Bs. 2.000',
  },

  'Trío vocal instrumental': {
    descripcion: 'Los tres integrantes cantan a tres voces y ejecutan un instrumento de forma simultánea durante todo el tema.',
    instrumentosPermitidos: [],
    instrumentosNoPermitidos: ['Batería (percusión)', 'Bajo eléctrico', NO_TECLADOS],
    documentacion: [DOC_CARTA, DOC_CI('de cada integrante'), DOC_BASE],
    criterios: [
      { label: 'Interpretación vocal y armonía', porcentaje: 30 },
      { label: 'Interpretación instrumental', porcentaje: 30 },
      { label: 'Expresión y dominio de escenario', porcentaje: 25 },
      { label: 'Indumentaria', porcentaje: 15 },
    ],
    premio: 'Oro Bs. 10.000 · Plata Bs. 5.000 · Bronce Bs. 2.000',
  },

  'Grupo vocal instrumental': {
    descripcion: 'Armonía vocal a mínimo cuatro voces, con todos los integrantes ejecutando un instrumento simultáneamente.',
    instrumentosPermitidos: ['Batería (percusión)', 'Bajo eléctrico', 'Pedal de volumen'],
    instrumentosNoPermitidos: [NO_TECLADOS],
    documentacion: [DOC_CARTA, DOC_CI('de cada integrante'), DOC_BASE],
    criterios: [
      { label: 'Interpretación vocal y armonía', porcentaje: 35 },
      { label: 'Interpretación y arreglos instrumentales', porcentaje: 35 },
      { label: 'Expresión y dominio de escenario', porcentaje: 15 },
      { label: 'Indumentaria', porcentaje: 15 },
    ],
    premio: 'Oro Bs. 14.000 · Plata Bs. 6.000 · Bronce Bs. 2.000',
  },

  Estudiantina: {
    descripcion: 'Tema instrumental (no vocal), con armonización y arreglos inéditos.',
    instrumentosPermitidos: [],
    instrumentosNoPermitidos: ['Batería (percusión)', 'Bajo eléctrico', NO_TECLADOS],
    documentacion: [
      DOC_CARTA,
      DOC_CI('de cada integrante'),
      DOC_BASE,
      'Si clasifica a la final: 5 ejemplares de la partitura con armonización y arreglos',
    ],
    criterios: [
      { label: 'Interpretación y ejecución instrumental', porcentaje: 40 },
      { label: 'Arreglos musicales propios (armonía)', porcentaje: 40 },
      { label: 'Indumentaria', porcentaje: 20 },
    ],
    premio: 'Oro Bs. 14.000 · Plata Bs. 6.000 · Bronce Bs. 2.000',
  },

  Autóctono: {
    descripcion: 'La interpretación debe representar fielmente la cultura y tradición del lugar de origen.',
    instrumentosPermitidos: ['Instrumentos autóctonos del patrimonio cultural boliviano'],
    instrumentosNoPermitidos: [],
    documentacion: [DOC_CARTA, DOC_CI('de cada integrante'), DOC_BASE],
    criterios: [
      { label: 'Dominio instrumental', porcentaje: 30 },
      { label: 'Armonía instrumental', porcentaje: 30 },
      { label: 'Dominio escénico y originalidad', porcentaje: 20 },
      { label: 'Indumentaria', porcentaje: 20 },
    ],
    premio: 'Oro Bs. 14.000 · Plata Bs. 6.000 · Bronce Bs. 2.000',
  },

  Composición: {
    descripcion: 'Canción de contenido libre, original e inédita — orientada a la revalorización de géneros folklóricos poco difundidos. Admite postulantes profesionales.',
    instrumentosPermitidos: ['Batería (percusión)', 'Bajo eléctrico'],
    instrumentosNoPermitidos: [NO_TECLADOS],
    documentacion: [
      '3 ejemplares del texto de la letra (preselección, Arial 12, interlineado 1,5)',
      DOC_CARTA,
      DOC_CI('del postulante y de cada intérprete'),
      'Declaración voluntaria eximiendo al comité de disputas de plagio/propiedad (Anexo 3)',
      'Si clasifica a la final: 5 ejemplares de la partitura y 5 del texto de la letra',
    ],
    criterios: [
      { label: 'Estructura musical', porcentaje: 40 },
      { label: 'Letra', porcentaje: 40 },
      { label: 'Originalidad', porcentaje: 20 },
    ],
    premio: 'Oro Bs. 7.000 · Plata Bs. 5.000 · Bronce Bs. 2.000',
  },

  'Solista vocal infantil': {
    instrumentosPermitidos: ['Batería (percusión)', 'Bajo eléctrico'],
    instrumentosNoPermitidos: [NO_TECLADOS, 'Pistas instrumentales de acompañamiento (karaoke)'],
    documentacion: [
      DOC_CARTA,
      DOC_CI('del postulante, acompañantes y del adulto responsable'),
      DOC_AUTORIZACION_ADULTO,
    ],
    criterios: [
      { label: 'Interpretación', porcentaje: 50 },
      { label: 'Expresión y dominio de escenario', porcentaje: 20 },
      { label: 'Técnica vocal', porcentaje: 15 },
      { label: 'Indumentaria', porcentaje: 15 },
    ],
    premio: 'Oro Bs. 5.000 · Plata Bs. 3.000 · Bronce Bs. 2.000',
  },

  'Solista instrumental infantil': {
    instrumentosPermitidos: [],
    instrumentosNoPermitidos: ['Batería (percusión)', 'Bajo eléctrico', NO_TECLADOS],
    documentacion: [
      DOC_CARTA,
      DOC_CI('del postulante, acompañante (si tiene uno) y del adulto responsable'),
      DOC_AUTORIZACION_ADULTO,
    ],
    criterios: [
      { label: 'Interpretación instrumental', porcentaje: 60 },
      { label: 'Expresión y dominio de escenario', porcentaje: 30 },
      { label: 'Indumentaria', porcentaje: 10 },
    ],
    premio: 'Oro Bs. 5.000 · Plata Bs. 3.000 · Bronce Bs. 2.000',
  },

  Especial: {
    descripcion: 'Agrupaciones bolivianas profesionales con trayectoria artística. Admite un encargado de sonido adicional a los integrantes. La canción debe ser inédita.',
    instrumentosPermitidos: ['Batería (percusión)', 'Bajo eléctrico', 'Teclados', 'Pedales'],
    instrumentosNoPermitidos: ['Secuenciadores, samplers u otros efectos similares'],
    documentacion: [DOC_CARTA, DOC_CI('de cada integrante')],
    criterios: [
      { label: 'Técnica vocal', porcentaje: 35 },
      { label: 'Técnica instrumental', porcentaje: 35 },
      { label: 'Dominio escénico y originalidad', porcentaje: 15 },
      { label: 'Indumentaria', porcentaje: 15 },
    ],
    premio: 'Oro Bs. 34.000 (premio único)',
  },
};

export function obtenerConvocatoriaCategoria(nombre: string): ConvocatoriaCategoria | null {
  return CONVOCATORIA_CATEGORIAS[nombre] ?? null;
}
