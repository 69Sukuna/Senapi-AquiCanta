// Pestañas que se sacan del sitio público sin borrar su código: quedan
// listas para reactivarse (cambiar el valor a `true`) el día que se
// vuelvan a usar. A diferencia de lib/vistas.ts (que el admin prende/apaga
// en caliente desde /adminpanel/vistas y es "fail-open" si la API falla),
// esto es a propósito hardcodeado y "fail-closed": una decisión de deploy,
// no un control que dependa de la base de datos estar arriba.
export const FEATURE_FLAGS = {
  participantes: false,
  jurado: false,
} as const;
