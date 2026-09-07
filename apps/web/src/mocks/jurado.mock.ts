import type { CategoriaConcurso, CriterioEvaluacionDefinicion, JuezPerfil } from '@/types';

// Retratos reales (no avatares generados) como "standin" fotográfico de
// cada juez ficticio — mismo criterio ya usado en apps/web/public/images/participantes/
// para los participantes de ejemplo (ver comentario en packages/database/prisma/seed.ts).
// Se sirven como archivos locales en apps/web/public/images/jurado/ en vez de
// hotlinkear a un servicio externo.
export const JURADO_TITULARES: JuezPerfil[] = [
  {
    id: 'jurado-01',
    nombre: 'Elizabeth Rey',
    especialidad: 'Técnica vocal y dirección coral',
    esPortavoz: true,
    fotoUrl: '/images/jurado/elizabeth-rey.jpg',
  },
  {
    id: 'jurado-02',
    nombre: 'Ramiro Gutiérrez',
    especialidad: 'Composición y folklore boliviano',
    esPortavoz: false,
    fotoUrl: '/images/jurado/ramiro-gutierrez.jpg',
  },
  {
    id: 'jurado-03',
    nombre: 'Fabiola Áñez',
    especialidad: 'Interpretación y producción musical',
    esPortavoz: false,
    fotoUrl: '/images/jurado/fabiola-anez.jpg',
  },
  {
    id: 'jurado-04',
    nombre: 'Hugo Mamani',
    especialidad: 'Instrumentación andina',
    esPortavoz: false,
    fotoUrl: '/images/jurado/hugo-mamani.jpg',
  },
  {
    id: 'jurado-05',
    nombre: 'Carla Suárez',
    especialidad: 'Educación musical y dominio escénico',
    esPortavoz: false,
    fotoUrl: '/images/jurado/carla-suarez.jpg',
  },
];

// Las 13 categorías oficiales de la convocatoria (Guía Explicativa §3), en el
// mismo orden del cuadro de la convocatoria. Se usa para poblar el selector
// de categorías del jurado con las 13 completas, no solo las que ya tengan
// participantes de ejemplo cargados en PARTICIPANTES_CALIFICACION.
export const CATEGORIAS_CONCURSO: CategoriaConcurso[] = [
  'Ñusta',
  'Solista Vocal',
  'Solista Instrumental – Armónico',
  'Solista Instrumental – Melódico',
  'Dúo Vocal Instrumental',
  'Trío Vocal Instrumental',
  'Grupo Vocal Instrumental',
  'Estudiantina',
  'Autóctono',
  'Composición',
  'Solista Vocal Infantil',
  'Solista Instrumental Infantil',
  'Especial',
];

// Baremo oficial por categoría — Guía Explicativa de la Convocatoria XXXIII
// "Aquí... Canta Bolivia" 2026, §5 (BAREMO Y PARÁMETROS OFICIALES DE
// CALIFICACIÓN). Cada categoría pondera el 100% de forma distinta, así que
// no existe un único set de criterios: la planilla del jurado debe armarse
// según la categoría del participante activo.
export const CRITERIOS_POR_CATEGORIA: Record<CategoriaConcurso, CriterioEvaluacionDefinicion[]> = {
  Ñusta: [
    {
      clave: 'interpretacionInstrumental',
      etiqueta: 'Interpretación instrumental',
      descripcion: 'Calidad interpretativa en los instrumentos ejecutados (mínimo 3, de familias distintas).',
      puntajeMaximo: 40,
    },
    {
      clave: 'interpretacionVocal',
      etiqueta: 'Interpretación vocal',
      descripcion: 'Calidad vocal e interpretativa del tema presentado.',
      puntajeMaximo: 30,
    },
    {
      clave: 'carismaEscenarioCultura',
      etiqueta: 'Carisma, dominio de escenario y conocimientos culturales',
      descripcion: 'Simpatía escénica y conocimiento del festival, la cultura y el folklore boliviano.',
      puntajeMaximo: 15,
    },
    {
      clave: 'indumentaria',
      etiqueta: 'Indumentaria típica regional',
      descripcion: 'Traje típico tradicional representativo del departamento de origen.',
      puntajeMaximo: 15,
    },
  ],
  'Solista Vocal': [
    {
      clave: 'interpretacion',
      etiqueta: 'Interpretación',
      descripcion: 'Emoción, fraseo e intención interpretativa del tema.',
      puntajeMaximo: 40,
    },
    {
      clave: 'tecnicaVocal',
      etiqueta: 'Técnica vocal',
      descripcion: 'Afinación, respiración, proyección y manejo del registro.',
      puntajeMaximo: 30,
    },
    {
      clave: 'expresionDominioEscenario',
      etiqueta: 'Expresión y dominio de escenario',
      descripcion: 'Seguridad, postura y presencia escénica durante la actuación.',
      puntajeMaximo: 20,
    },
    {
      clave: 'indumentaria',
      etiqueta: 'Indumentaria representativa',
      descripcion: 'Vestuario acorde al género folklórico interpretado.',
      puntajeMaximo: 10,
    },
  ],
  'Solista Instrumental – Armónico': [
    {
      clave: 'dominioInstrumental',
      etiqueta: 'Dominio instrumental',
      descripcion: 'Ejecución simultánea de melodía y armonía en un solo instrumento polifónico.',
      puntajeMaximo: 50,
    },
    {
      clave: 'interpretacionExpresion',
      etiqueta: 'Interpretación y expresión',
      descripcion: 'Musicalidad e intención interpretativa del tema instrumental.',
      puntajeMaximo: 30,
    },
    {
      clave: 'indumentaria',
      etiqueta: 'Indumentaria',
      descripcion: 'Vestuario acorde al género folklórico interpretado.',
      puntajeMaximo: 20,
    },
  ],
  'Solista Instrumental – Melódico': [
    {
      clave: 'dominioInstrumental',
      etiqueta: 'Dominio instrumental',
      descripcion: 'Precisión y control del instrumento monofónico (quena, zampoña, violín, etc.).',
      puntajeMaximo: 50,
    },
    {
      clave: 'interpretacionExpresion',
      etiqueta: 'Interpretación y expresión',
      descripcion: 'Musicalidad e intención interpretativa del tema instrumental.',
      puntajeMaximo: 30,
    },
    {
      clave: 'indumentaria',
      etiqueta: 'Indumentaria',
      descripcion: 'Vestuario acorde al género folklórico interpretado.',
      puntajeMaximo: 20,
    },
  ],
  'Dúo Vocal Instrumental': [
    {
      clave: 'interpretacionVocalArmonia',
      etiqueta: 'Interpretación vocal y armonía a dos voces',
      descripcion: 'Afinación y empaste de la armonía vocal a dos voces claramente definidas.',
      puntajeMaximo: 30,
    },
    {
      clave: 'interpretacionInstrumentalSimultanea',
      etiqueta: 'Interpretación instrumental simultánea',
      descripcion: 'Ejecución instrumental de ambos integrantes durante toda la canción, en simultáneo al canto.',
      puntajeMaximo: 30,
    },
    {
      clave: 'expresionDominioEscenario',
      etiqueta: 'Expresión y dominio de escenario',
      descripcion: 'Seguridad y presencia escénica del dúo.',
      puntajeMaximo: 25,
    },
    {
      clave: 'indumentaria',
      etiqueta: 'Indumentaria',
      descripcion: 'Vestuario acorde al género folklórico interpretado.',
      puntajeMaximo: 15,
    },
  ],
  'Trío Vocal Instrumental': [
    {
      clave: 'interpretacionVocalArmonia',
      etiqueta: 'Interpretación vocal y armonía a tres voces',
      descripcion: 'Afinación y empaste de la armonía vocal a tres voces simultáneas.',
      puntajeMaximo: 30,
    },
    {
      clave: 'interpretacionInstrumentalSimultanea',
      etiqueta: 'Interpretación instrumental simultánea',
      descripcion: 'Ejecución instrumental de los 3 integrantes durante toda la canción, en simultáneo al canto.',
      puntajeMaximo: 30,
    },
    {
      clave: 'expresionDominioEscenario',
      etiqueta: 'Expresión y dominio de escenario',
      descripcion: 'Seguridad y presencia escénica del trío.',
      puntajeMaximo: 25,
    },
    {
      clave: 'indumentaria',
      etiqueta: 'Indumentaria',
      descripcion: 'Vestuario acorde al género folklórico interpretado.',
      puntajeMaximo: 15,
    },
  ],
  'Grupo Vocal Instrumental': [
    {
      clave: 'interpretacionVocalArmonia',
      etiqueta: 'Interpretación vocal y armonía (mínimo 4 voces)',
      descripcion: 'Canto estructurado a cuatro voces como mínimo.',
      puntajeMaximo: 35,
    },
    {
      clave: 'interpretacionArreglosInstrumentales',
      etiqueta: 'Interpretación y arreglos instrumentales',
      descripcion: 'Ejecución instrumental en vivo de todos los integrantes a la par del canto.',
      puntajeMaximo: 35,
    },
    {
      clave: 'expresionDominioEscenario',
      etiqueta: 'Expresión y dominio de escenario',
      descripcion: 'Seguridad y presencia escénica del grupo.',
      puntajeMaximo: 15,
    },
    {
      clave: 'indumentaria',
      etiqueta: 'Indumentaria',
      descripcion: 'Vestuario acorde al género folklórico interpretado.',
      puntajeMaximo: 15,
    },
  ],
  Estudiantina: [
    {
      clave: 'interpretacionEjecucionInstrumental',
      etiqueta: 'Interpretación y ejecución instrumental',
      descripcion: 'Precisión y cohesión instrumental de la pieza 100% instrumental.',
      puntajeMaximo: 40,
    },
    {
      clave: 'arreglosPropios',
      etiqueta: 'Arreglos musicales propios (armonización inédita)',
      descripcion: 'Originalidad y calidad de los arreglos y la armonización presentados.',
      puntajeMaximo: 40,
    },
    {
      clave: 'indumentaria',
      etiqueta: 'Indumentaria',
      descripcion: 'Vestuario acorde a la agrupación.',
      puntajeMaximo: 20,
    },
  ],
  Autóctono: [
    {
      clave: 'dominioInstrumentalAutoctono',
      etiqueta: 'Dominio instrumental autóctono',
      descripcion: 'Manejo técnico de los instrumentos autóctonos originarios (tarkas, sicus, pinquillos, etc.).',
      puntajeMaximo: 30,
    },
    {
      clave: 'armoniaInstrumental',
      etiqueta: 'Armonía instrumental',
      descripcion: 'Cohesión y empaste sonoro entre los integrantes.',
      puntajeMaximo: 30,
    },
    {
      clave: 'dominioEscenicoOriginalidad',
      etiqueta: 'Dominio escénico y originalidad cultural',
      descripcion: 'Presencia escénica y fidelidad cultural de la representación.',
      puntajeMaximo: 20,
    },
    {
      clave: 'indumentariaTradicional',
      etiqueta: 'Indumentaria tradicional comunitaria',
      descripcion: 'Vestuario tradicional de la comunidad o región de origen.',
      puntajeMaximo: 20,
    },
  ],
  Composición: [
    {
      clave: 'estructuraMusical',
      etiqueta: 'Estructura musical',
      descripcion: 'Coherencia armónica, melódica y formal de la composición.',
      puntajeMaximo: 40,
    },
    {
      clave: 'letra',
      etiqueta: 'Letra',
      descripcion: 'Calidad literaria y coherencia del texto con la obra.',
      puntajeMaximo: 40,
    },
    {
      clave: 'originalidadRescateFolklorico',
      etiqueta: 'Originalidad y rescate folklórico',
      descripcion: 'Aporte original y orientación al rescate de ritmos en peligro de extinción o escasa difusión.',
      puntajeMaximo: 20,
    },
  ],
  'Solista Vocal Infantil': [
    {
      clave: 'interpretacion',
      etiqueta: 'Interpretación',
      descripcion: 'Emoción e intención interpretativa del tema folklórico.',
      puntajeMaximo: 50,
    },
    {
      clave: 'expresionDominioEscenico',
      etiqueta: 'Expresión y dominio escénico',
      descripcion: 'Seguridad y presencia escénica acorde a la edad.',
      puntajeMaximo: 20,
    },
    {
      clave: 'tecnicaVocal',
      etiqueta: 'Técnica vocal',
      descripcion: 'Afinación y control vocal.',
      puntajeMaximo: 15,
    },
    {
      clave: 'indumentaria',
      etiqueta: 'Indumentaria',
      descripcion: 'Vestuario acorde al género folklórico interpretado.',
      puntajeMaximo: 15,
    },
  ],
  'Solista Instrumental Infantil': [
    {
      clave: 'interpretacionInstrumental',
      etiqueta: 'Interpretación instrumental',
      descripcion: 'Precisión y control del instrumento ejecutado.',
      puntajeMaximo: 60,
    },
    {
      clave: 'expresionDominioEscenico',
      etiqueta: 'Expresión y dominio escénico',
      descripcion: 'Seguridad y presencia escénica acorde a la edad.',
      puntajeMaximo: 30,
    },
    {
      clave: 'indumentaria',
      etiqueta: 'Indumentaria',
      descripcion: 'Vestuario acorde al género folklórico interpretado.',
      puntajeMaximo: 10,
    },
  ],
  Especial: [
    {
      clave: 'tecnicaVocal',
      etiqueta: 'Técnica vocal',
      descripcion: 'Dominio vocal de la agrupación profesional.',
      puntajeMaximo: 35,
    },
    {
      clave: 'tecnicaInstrumental',
      etiqueta: 'Técnica instrumental',
      descripcion: 'Dominio instrumental de la agrupación profesional.',
      puntajeMaximo: 35,
    },
    {
      clave: 'dominioEscenicoOriginalidad',
      etiqueta: 'Dominio escénico y originalidad',
      descripcion: 'Presencia escénica y originalidad de la propuesta inédita.',
      puntajeMaximo: 15,
    },
    {
      clave: 'indumentaria',
      etiqueta: 'Indumentaria',
      descripcion: 'Vestuario acorde a la agrupación.',
      puntajeMaximo: 15,
    },
  ],
};

// Cada categoría pondera distinto, pero el baremo oficial siempre suma
// 100% (ver §5 de la Guía Explicativa), así que el puntaje máximo total es
// una constante única, no por categoría.
export const PUNTAJE_MAXIMO_TOTAL = 100;
