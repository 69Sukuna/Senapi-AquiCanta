// Las 13 categorías oficiales de la convocatoria (Guía Explicativa §3).
export type CategoriaConcurso =
  | 'Ñusta'
  | 'Solista Vocal'
  | 'Solista Instrumental – Armónico'
  | 'Solista Instrumental – Melódico'
  | 'Dúo Vocal Instrumental'
  | 'Trío Vocal Instrumental'
  | 'Grupo Vocal Instrumental'
  | 'Estudiantina'
  | 'Autóctono'
  | 'Composición'
  | 'Solista Vocal Infantil'
  | 'Solista Instrumental Infantil'
  | 'Especial';

export interface ObraMusical {
  titulo: string;
  ritmo: string;
  autor: string;
  duracionSegundos: number;
}

export interface ParametrosEvaluacion {
  tecnicaVocal: number;
  dominioInstrumental: number;
  indumentariaTipica: number;
  dominioEscenario: number;
}

export interface ParticipanteCalificacion {
  id: string;
  nombreArtistico: string;
  categoria: CategoriaConcurso;
  departamento: string;
  imagen: string;
  obra: ObraMusical;
  instrumentos: string[];
  parametros: ParametrosEvaluacion;
}
