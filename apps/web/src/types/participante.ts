export type CategoriaConcurso =
  | 'Ñusta'
  | 'Solista Vocal'
  | 'Solista Instrumental Armónico/Melódico'
  | 'Dúo'
  | 'Trío'
  | 'Grupo Vocal Instrumental'
  | 'Estudiantina'
  | 'Autóctono'
  | 'Composición'
  | 'Especial'
  | 'Internacional';

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
