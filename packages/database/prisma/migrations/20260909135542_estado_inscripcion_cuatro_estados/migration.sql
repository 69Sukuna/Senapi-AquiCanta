-- Renombra PENDIENTE/APROBADO y agrega PRESELECCION al enum EstadoInscripcion,
-- pasando de {PENDIENTE, APROBADO, RECHAZADO} a
-- {SIN_CONFIRMAR, PRESELECCION, PARTICIPANTE_FINAL, RECHAZADO}.
-- ADD VALUE no puede ir en la misma transacción que un uso del valor nuevo,
-- por eso va en su propio statement antes de cualquier default que lo use.
ALTER TYPE "EstadoInscripcion" RENAME VALUE 'PENDIENTE' TO 'SIN_CONFIRMAR';
ALTER TYPE "EstadoInscripcion" RENAME VALUE 'APROBADO' TO 'PARTICIPANTE_FINAL';
ALTER TYPE "EstadoInscripcion" ADD VALUE IF NOT EXISTS 'PRESELECCION' BEFORE 'PARTICIPANTE_FINAL';
