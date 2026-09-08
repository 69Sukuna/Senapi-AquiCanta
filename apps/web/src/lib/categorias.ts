// Categorías del Anexo 1 (Ficha de Postulación), agrupadas solo para
// presentación (selector de /inscripciones). Los límites vienen de
// CONVOCATORIA AQUI CANTA BOLIVIA, 26 AGOSTO 2026, y espejan exactamente los
// mismos valores sembrados en packages/database/prisma/seed.ts (Categoria).
export interface CategoriaInfo {
  nombre: string;
  integrantesMin: number;
  integrantesMax: number;
  // Máximo de músicos de acompañamiento (solo categorías individuales).
  acompanantesMax: number;
  // Rango de edad exigido al 10-sep-2026 (fecha de lanzamiento). null = libre.
  edadMinima: number | null;
  edadMaxima: number | null;
  // Categorías infantiles: la convocatoria exige nombre y C.I. de un adulto
  // responsable (padre, madre o tutor legal) del postulante.
  requiereAdultoResponsable: boolean;
  // Duración máxima del tema, en minutos, para la etapa de preselección.
  duracionMaximaMinutos: number;
}

export interface GrupoCategorias {
  label: string;
  categorias: CategoriaInfo[];
}

const SIN_LIMITE_EXTRA = {
  edadMinima: null,
  edadMaxima: null,
  requiereAdultoResponsable: false,
  duracionMaximaMinutos: 5,
} as const;

export const GRUPOS_CATEGORIAS: GrupoCategorias[] = [
  {
    label: 'Solistas',
    categorias: [
      { nombre: 'Solista vocal', integrantesMin: 1, integrantesMax: 1, acompanantesMax: 5, ...SIN_LIMITE_EXTRA },
      {
        nombre: 'Solista instrumental – Armónico',
        integrantesMin: 1,
        integrantesMax: 1,
        acompanantesMax: 1,
        ...SIN_LIMITE_EXTRA,
      },
      {
        nombre: 'Solista instrumental – Melódico',
        integrantesMin: 1,
        integrantesMax: 1,
        acompanantesMax: 1,
        ...SIN_LIMITE_EXTRA,
      },
    ],
  },
  {
    label: 'Agrupaciones',
    categorias: [
      {
        nombre: 'Dúo vocal instrumental',
        integrantesMin: 2,
        integrantesMax: 2,
        acompanantesMax: 0,
        ...SIN_LIMITE_EXTRA,
      },
      {
        nombre: 'Trío vocal instrumental',
        integrantesMin: 3,
        integrantesMax: 3,
        acompanantesMax: 0,
        ...SIN_LIMITE_EXTRA,
      },
      {
        nombre: 'Grupo vocal instrumental',
        integrantesMin: 4,
        integrantesMax: 8,
        acompanantesMax: 0,
        ...SIN_LIMITE_EXTRA,
      },
      {
        nombre: 'Estudiantina',
        integrantesMin: 8,
        integrantesMax: 15,
        acompanantesMax: 0,
        ...SIN_LIMITE_EXTRA,
        duracionMaximaMinutos: 7,
      },
    ],
  },
  {
    label: 'Tradicional y autóctono',
    categorias: [
      {
        nombre: 'Ñusta',
        integrantesMin: 1,
        integrantesMax: 1,
        acompanantesMax: 0,
        edadMinima: 16,
        edadMaxima: 25,
        requiereAdultoResponsable: false,
        duracionMaximaMinutos: 10,
      },
      {
        nombre: 'Autóctono',
        integrantesMin: 8,
        integrantesMax: 20,
        acompanantesMax: 0,
        ...SIN_LIMITE_EXTRA,
        duracionMaximaMinutos: 7,
      },
    ],
  },
  {
    label: 'Infantil',
    categorias: [
      {
        nombre: 'Solista vocal infantil',
        integrantesMin: 1,
        integrantesMax: 1,
        acompanantesMax: 5,
        edadMinima: null,
        edadMaxima: 12,
        requiereAdultoResponsable: true,
        duracionMaximaMinutos: 5,
      },
      {
        nombre: 'Solista instrumental infantil',
        integrantesMin: 1,
        integrantesMax: 1,
        acompanantesMax: 1,
        edadMinima: null,
        edadMaxima: 12,
        requiereAdultoResponsable: true,
        duracionMaximaMinutos: 5,
      },
    ],
  },
  {
    label: 'Composición y especial',
    categorias: [
      { nombre: 'Composición', integrantesMin: 1, integrantesMax: 1, acompanantesMax: 5, ...SIN_LIMITE_EXTRA },
      // 10 integrantes + 1 encargado de sonido opcional (se cuenta como un
      // integrante más, distinguible por su instrumento).
      { nombre: 'Especial', integrantesMin: 1, integrantesMax: 11, acompanantesMax: 0, ...SIN_LIMITE_EXTRA },
    ],
  },
];

const TODAS_LAS_CATEGORIAS = GRUPOS_CATEGORIAS.flatMap((grupo) => grupo.categorias);

export function obtenerCategoriaInfo(nombre: string): CategoriaInfo | null {
  return TODAS_LAS_CATEGORIAS.find((c) => c.nombre === nombre) ?? null;
}

export function esCategoriaGrupal(nombre: string): boolean {
  return (obtenerCategoriaInfo(nombre)?.integrantesMax ?? 1) > 1;
}

// Composición y Especial son las únicas categorías donde la convocatoria
// admite postulantes profesionales — no se les exige la declaración de
// "no soy profesional" en el Anexo 3 (sí la de exención de plagio/propiedad).
export function esCategoriaExentaDeclaracionProfesional(nombre: string): boolean {
  return nombre === 'Composición' || nombre === 'Especial';
}
