// Estilos compartidos por las 4 pestañas de administración de Sellos — evita
// repetir las mismas clases de Tailwind (inputs, botones) en cada archivo.
export const inputClase =
  'w-full rounded-xl border border-(--border) bg-white px-3! py-2! text-sm text-(--text-primary) outline-none transition-colors duration-200 focus:border-(--brand-rojo)/50';

export const botonPrimario =
  'rounded-full bg-(--brand-negro) px-5! py-2! text-sm font-bold text-white transition-opacity duration-200 disabled:opacity-40';

export const botonSecundario =
  'w-fit rounded-full border border-(--border) px-5! py-2! text-sm font-bold text-(--text-secondary) transition-colors duration-200 hover:text-(--text-primary)';

export const botonPeligro =
  'rounded-full border border-[#d52b1e]/40 px-4! py-1.5! text-xs font-bold text-[#d52b1e] transition-opacity duration-200 disabled:opacity-40';

export function Campo({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 text-xs font-semibold text-(--text-secondary) ${className ?? ''}`}>
      {label}
      {children}
    </label>
  );
}

// Flechas subir/bajar para reordenar una lista (Eventos, Rangos, Medallas) —
// en vez de un número de "orden" editable a mano, que confundía y podía
// dejar huecos/duplicados. `onMover` recibe la lista ya reordenada
// localmente; quien la use decide cómo persistirla (ver `moverEnLista`).
export function BotonesOrden({
  esPrimero,
  esUltimo,
  onSubir,
  onBajar,
  deshabilitado,
}: {
  esPrimero: boolean;
  esUltimo: boolean;
  onSubir: () => void;
  onBajar: () => void;
  deshabilitado?: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-0.5!">
      <button
        type="button"
        onClick={onSubir}
        disabled={esPrimero || deshabilitado}
        aria-label="Mover arriba"
        className="flex h-6 w-6 items-center justify-center rounded-md border border-(--border) text-(--text-secondary) transition-colors duration-200 hover:text-(--text-primary) disabled:opacity-30"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={onBajar}
        disabled={esUltimo || deshabilitado}
        aria-label="Mover abajo"
        className="flex h-6 w-6 items-center justify-center rounded-md border border-(--border) text-(--text-secondary) transition-colors duration-200 hover:text-(--text-primary) disabled:opacity-30"
      >
        ▼
      </button>
    </div>
  );
}

// Devuelve una copia de `lista` con el elemento en `indice` intercambiado por
// su vecino (arriba o abajo) — la base para las flechas de arriba.
export function moverEnLista<T>(lista: T[], indice: number, direccion: 'arriba' | 'abajo'): T[] {
  const destino = direccion === 'arriba' ? indice - 1 : indice + 1;
  if (destino < 0 || destino >= lista.length) return lista;
  const copia = lista.slice();
  [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
  return copia;
}
