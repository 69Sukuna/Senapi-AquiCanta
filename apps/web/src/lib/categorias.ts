// Categorías del Anexo 1 (Ficha de Postulación), agrupadas solo para
// presentación (selector de /inscripciones, listado de /categorias).
// `esGrupal` espeja el campo del mismo nombre en Categoria (Prisma) — decide
// si una postulación crea un Cantante o un Grupo con integrantes.
export interface CategoriaInfo {
  nombre: string;
  esGrupal: boolean;
}

export interface GrupoCategorias {
  label: string;
  categorias: CategoriaInfo[];
}

export const GRUPOS_CATEGORIAS: GrupoCategorias[] = [
  {
    label: 'Solistas',
    categorias: [
      { nombre: 'Solista vocal', esGrupal: false },
      { nombre: 'Solista instrumental – Armónico', esGrupal: false },
      { nombre: 'Solista instrumental – Melódico', esGrupal: false },
    ],
  },
  {
    label: 'Agrupaciones',
    categorias: [
      { nombre: 'Dúo vocal instrumental', esGrupal: true },
      { nombre: 'Trío vocal instrumental', esGrupal: true },
      { nombre: 'Grupo vocal instrumental', esGrupal: true },
      { nombre: 'Estudiantina', esGrupal: true },
    ],
  },
  {
    label: 'Tradicional y autóctono',
    categorias: [
      { nombre: 'Ñusta', esGrupal: false },
      { nombre: 'Autóctono', esGrupal: false },
    ],
  },
  {
    label: 'Infantil',
    categorias: [
      { nombre: 'Solista vocal infantil', esGrupal: false },
      { nombre: 'Solista instrumental infantil', esGrupal: false },
    ],
  },
  {
    label: 'Composición y especial',
    categorias: [
      { nombre: 'Composición', esGrupal: false },
      { nombre: 'Especial', esGrupal: false },
    ],
  },
];

export function esCategoriaGrupal(nombre: string): boolean {
  return GRUPOS_CATEGORIAS.some((grupo) => grupo.categorias.some((c) => c.nombre === nombre && c.esGrupal));
}
