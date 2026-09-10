// Corte de edad fijo de la convocatoria (CONVOCATORIA AQUI CANTA BOLIVIA, 26
// AGOSTO 2026): Ñusta e infantiles se miden contra esta fecha, no contra hoy.
export const FECHA_CORTE_CONVOCATORIA = new Date('2026-09-10T00:00:00Z');

export function edadEnFecha(fechaNacimiento: Date, fechaCorte: Date = FECHA_CORTE_CONVOCATORIA): number {
  let edad = fechaCorte.getUTCFullYear() - fechaNacimiento.getUTCFullYear();
  const aunNoCumpleEsteAno =
    fechaCorte.getUTCMonth() < fechaNacimiento.getUTCMonth() ||
    (fechaCorte.getUTCMonth() === fechaNacimiento.getUTCMonth() && fechaCorte.getUTCDate() < fechaNacimiento.getUTCDate());
  if (aunNoCumpleEsteAno) edad--;
  return edad;
}

export function cumpleRangoEdad(
  fechaNacimiento: Date,
  edadMinima: number | null,
  edadMaxima: number | null,
  fechaCorte: Date = FECHA_CORTE_CONVOCATORIA,
): boolean {
  const edad = edadEnFecha(fechaNacimiento, fechaCorte);
  if (edadMinima != null && edad < edadMinima) return false;
  if (edadMaxima != null && edad > edadMaxima) return false;
  return true;
}
