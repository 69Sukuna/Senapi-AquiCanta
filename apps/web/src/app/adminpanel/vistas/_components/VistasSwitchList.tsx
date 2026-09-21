'use client';

import { useState } from 'react';
import { fetchAdmin } from '@/lib/auth';
import type { ConfiguracionVista } from './tipos';

// timeZone fija a propósito: sin esto, Intl usa la zona horaria local del
// runtime — que en el servidor (Node) puede no coincidir con la del
// navegador — y React marca error de hidratación al comparar el HTML del
// server contra el del cliente.
const formateadorFechaHora = new Intl.DateTimeFormat('es-BO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/La_Paz',
});

interface VistasSwitchListProps {
  vistasIniciales: ConfiguracionVista[];
}

export function VistasSwitchList({ vistasIniciales }: VistasSwitchListProps) {
  const [vistas, setVistas] = useState(vistasIniciales);
  const [guardando, setGuardando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function alternar(clave: string, activoActual: boolean) {
    setGuardando(clave);
    setError(null);

    // Optimista: la UI cambia al toque, y se revierte si la API falla.
    setVistas((lista) => lista.map((v) => (v.clave === clave ? { ...v, activo: !activoActual } : v)));

    try {
      const res = await fetchAdmin(`/configuraciones-vista/${clave}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !activoActual }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar');
      const actualizado = (await res.json()) as ConfiguracionVista;
      setVistas((lista) => lista.map((v) => (v.clave === clave ? actualizado : v)));
    } catch {
      setVistas((lista) => lista.map((v) => (v.clave === clave ? { ...v, activo: activoActual } : v)));
      setError(`No se pudo actualizar "${clave}". Intenta de nuevo.`);
    } finally {
      setGuardando(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm font-semibold text-[#d52b1e]">{error}</p>}

      {vistas.map((vista) => (
        <div
          key={vista.clave}
          className="flex items-center justify-between gap-4 rounded-2xl border border-(--border) bg-(--bg-card) p-5!"
        >
          <div>
            <p className="font-bold text-(--text-primary)">{vista.nombre}</p>
            {vista.descripcion && <p className="mt-0.5! text-sm text-(--text-secondary)">{vista.descripcion}</p>}
            <p className="mt-1! font-mono text-xs text-(--text-muted)">
              /{vista.clave} · actualizado {formateadorFechaHora.format(new Date(vista.updatedAt))}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={vista.activo}
            disabled={guardando === vista.clave}
            onClick={() => alternar(vista.clave, vista.activo)}
            className={`relative inline-flex! h-7 w-13 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${
              vista.activo ? 'bg-[#2e7d46]' : 'bg-(--border)'
            }`}
          >
            {/* Sin position:absolute a propósito: con eso, el thumb sin un
                `left` explícito quedaba en su "posición estática" dentro del
                <button> (que el navegador no ubica en el borde izquierdo de
                forma confiable) y el translate-x lo mandaba fuera del track.
                Como hijo de flex normal, su posición base es determinista
                (borde izquierdo del track) y translate-x mueve desde ahí. */}
            <span
              aria-hidden="true"
              className={`inline-block! h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                vista.activo ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}
