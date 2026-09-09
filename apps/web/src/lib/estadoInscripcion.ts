// Estados del funnel de selección de un inscrito (Cantante o Grupo). Solo el
// admin puede cambiarlos (panel /adminpanel/inscritos) — el sitio público
// solo muestra a quienes llegaron a PARTICIPANTE_FINAL (ver
// apps/api/src/cantantes/cantantes.service.ts y grupos.service.ts).
export type EstadoInscripcion = 'SIN_CONFIRMAR' | 'PRESELECCION' | 'PARTICIPANTE_FINAL' | 'RECHAZADO';

export const ESTADOS_INSCRIPCION: Record<EstadoInscripcion, { label: string; color: string }> = {
  SIN_CONFIRMAR: { label: 'Sin confirmar', color: '#808080' },
  PRESELECCION: { label: 'Preselección', color: '#e0a527' },
  PARTICIPANTE_FINAL: { label: 'Participante final', color: '#2e7d46' },
  RECHAZADO: { label: 'Rechazado', color: '#d52b1e' },
};

export const ORDEN_ESTADOS: EstadoInscripcion[] = ['SIN_CONFIRMAR', 'PRESELECCION', 'PARTICIPANTE_FINAL', 'RECHAZADO'];
