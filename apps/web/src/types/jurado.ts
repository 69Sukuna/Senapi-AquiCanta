export type ClaveCriterioEvaluacion =
  | 'afinacion'
  | 'tecnicaVocal'
  | 'ritmo'
  | 'calidadVoz'
  | 'interpretacion'
  | 'dominioEscenico'
  | 'diccion'
  | 'musicalidad';

export interface CriterioEvaluacionDefinicion {
  clave: ClaveCriterioEvaluacion;
  etiqueta: string;
  descripcion: string;
  puntajeMaximo: number;
}

export interface JuezPerfil {
  id: string;
  nombre: string;
  especialidad: string;
  esPortavoz: boolean;
}

// Puntaje parcial: solo contiene las claves de los criterios ya calificados por el jurado.
export type PuntajesCriterios = Partial<Record<ClaveCriterioEvaluacion, number>>;

// jurado.id -> participante.id -> puntajes por criterio
export type PuntajesPorJurado = Record<string, Record<string, PuntajesCriterios>>;

// jurado.id -> participante.id -> ¿la calificación ya fue emitida y quedó bloqueada?
export type EmisionesPorJurado = Record<string, Record<string, boolean>>;

export interface ResultadoConsolidadoJurado {
  participanteId: string;
  nombreArtistico: string;
  categoria: string;
  // Promedio de los totales (0-100) entre los jurados que ya completaron su evaluación. `null` si nadie calificó aún.
  promedio: number | null;
  juecesQueCalificaron: number;
  totalJueces: number;
  puesto: number | null;
}
