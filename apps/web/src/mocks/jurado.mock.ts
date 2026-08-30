import type { CriterioEvaluacionDefinicion, JuezPerfil } from '@/types';

export const JURADO_TITULARES: JuezPerfil[] = [
  {
    id: 'jurado-01',
    nombre: 'Elizabeth Rey',
    especialidad: 'Técnica vocal y dirección coral',
    esPortavoz: true,
  },
  {
    id: 'jurado-02',
    nombre: 'Ramiro Gutiérrez',
    especialidad: 'Composición y folklore boliviano',
    esPortavoz: false,
  },
  {
    id: 'jurado-03',
    nombre: 'Fabiola Áñez',
    especialidad: 'Interpretación y producción musical',
    esPortavoz: false,
  },
  {
    id: 'jurado-04',
    nombre: 'Hugo Mamani',
    especialidad: 'Instrumentación andina',
    esPortavoz: false,
  },
  {
    id: 'jurado-05',
    nombre: 'Carla Suárez',
    especialidad: 'Educación musical y dominio escénico',
    esPortavoz: false,
  },
];

// Escala 1-100 · Distribución de criterios recomendada para Solista Vocal (Reglamento §7).
export const CRITERIOS_EVALUACION_JURADO: CriterioEvaluacionDefinicion[] = [
  {
    clave: 'afinacion',
    etiqueta: 'Afinación y precisión vocal',
    descripcion: 'Tonalidad, precisión de notas, control de la entonación y estabilidad de la voz.',
    puntajeMaximo: 20,
  },
  {
    clave: 'tecnicaVocal',
    etiqueta: 'Técnica vocal',
    descripcion: 'Respiración, apoyo vocal, proyección y manejo del registro.',
    puntajeMaximo: 15,
  },
  {
    clave: 'ritmo',
    etiqueta: 'Ritmo y precisión musical',
    descripcion: 'Pulso, tempo y coordinación con el acompañamiento.',
    puntajeMaximo: 15,
  },
  {
    clave: 'calidadVoz',
    etiqueta: 'Calidad y control de la voz',
    descripcion: 'Timbre, resonancia, claridad y uniformidad del sonido.',
    puntajeMaximo: 15,
  },
  {
    clave: 'interpretacion',
    etiqueta: 'Interpretación y expresividad',
    descripcion: 'Emoción, fraseo e intención interpretativa: ¿canta las notas o interpreta la canción?',
    puntajeMaximo: 15,
  },
  {
    clave: 'dominioEscenico',
    etiqueta: 'Dominio y presencia escénica',
    descripcion: 'Seguridad, postura, manejo del micrófono y contacto con el público.',
    puntajeMaximo: 10,
  },
  {
    clave: 'diccion',
    etiqueta: 'Dicción y pronunciación',
    descripcion: 'Claridad de las palabras, articulación y comprensión de la letra.',
    puntajeMaximo: 5,
  },
  {
    clave: 'musicalidad',
    etiqueta: 'Musicalidad y estilo',
    descripcion: 'Comprensión del género, fraseo y relación entre voz y acompañamiento.',
    puntajeMaximo: 5,
  },
];

export const PUNTAJE_MAXIMO_TOTAL = CRITERIOS_EVALUACION_JURADO.reduce(
  (acumulado, criterio) => acumulado + criterio.puntajeMaximo,
  0,
);
