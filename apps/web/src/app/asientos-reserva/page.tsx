'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Armchair, ChevronDown, ChevronUp, Info, Trash2 } from 'lucide-react';
import {
  generarMapaTeatro,
  NIVEL_COLOR,
  NIVEL_LABEL,
  PRECIOS,
  COLOR_OCUPADO,
  COLOR_SELECCIONADO,
  type Butaca,
  type NivelPrecio,
} from '@/lib/asientos';

// El mapa usa trigonometría (Math.sin/cos) para ubicar cada butaca; el motor
// V8 del server (Node) y el del browser pueden redondear el último bit
// distinto, lo que rompe la hidratación si el SVG se renderiza en el
// servidor. Al no tener valor de SEO este widget, se carga solo en cliente.
const TeatroSeatMap = dynamic(
  () => import('@/components/TeatroSeatMap').then((m) => m.TeatroSeatMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-white/5" />,
  }
);

const MAX_BUTACAS = 10;

export default function AsientosReservaPage() {
  // Mapa generado una sola vez: sectores/aforos vienen del plano del teatro,
  // pero no hay todavía modelo de asientos en Prisma, así que la ocupación es
  // un mock determinístico (ver apps/web/src/lib/asientos.ts).
  const { butacas, zonas } = useMemo(() => generarMapaTeatro(), []);
  const butacasPorId = useMemo(() => new Map(butacas.map((b) => [b.id, b])), [butacas]);

  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
  const [aviso, setAviso] = useState<string | null>(null);
  const [carritoAbierto, setCarritoAbierto] = useState(true);

  const toggleButaca = (butaca: Butaca) => {
    setAviso(null);
    setSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(butaca.id)) {
        next.delete(butaca.id);
      } else {
        if (next.size >= MAX_BUTACAS) {
          setAviso(`Podés seleccionar un máximo de ${MAX_BUTACAS} butacas por compra.`);
          return prev;
        }
        next.add(butaca.id);
      }
      return next;
    });
  };

  const seleccionList = useMemo(
    () =>
      [...seleccionadas]
        .map((id) => butacasPorId.get(id))
        .filter((b): b is Butaca => Boolean(b))
        .sort((a, b) => a.sectorLabel.localeCompare(b.sectorLabel) || a.fila - b.fila || a.numero - b.numero),
    [seleccionadas, butacasPorId]
  );

  const total = seleccionList.reduce((sum, b) => sum + PRECIOS[b.nivel], 0);

  const conteoPorNivel = seleccionList.reduce(
    (acc, b) => {
      acc[b.nivel] = (acc[b.nivel] ?? 0) + 1;
      return acc;
    },
    {} as Record<NivelPrecio, number>
  );

  return (
    <div className="flex h-dvh flex-col lg:h-[calc(100dvh-88px)]">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-3 pt-4 sm:px-6">
        <div>
          <span className="badge badge-gold w-fit mb-2">
            <Armchair size={14} /> Teatro Internacional de Oruro
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Reserva de Asientos</h1>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
          {(Object.keys(NIVEL_LABEL) as NivelPrecio[]).map((nivel) => (
            <span key={nivel} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: NIVEL_COLOR[nivel] }} />
              {NIVEL_LABEL[nivel]} · Bs {PRECIOS[nivel]}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_SELECCIONADO }} />
            Seleccionado
          </span>
          <span className="inline-flex items-center gap-1.5 opacity-70">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_OCUPADO }} />
            Ocupado
          </span>
        </div>
      </div>

      <div className="relative mx-2 mb-2 min-h-0 flex-1 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-card)] sm:mx-4 sm:mb-4">
        <TeatroSeatMap
          butacas={butacas}
          zonas={zonas}
          seleccionadas={seleccionadas}
          onToggle={toggleButaca}
        />

        {/* Carrito flotante: no ocupa columna propia para no achicar el mapa */}
        <div className="absolute bottom-3 left-3 right-3 z-10 max-h-[75%] overflow-hidden rounded-xl border border-[#e0a527]/25 bg-[#170406]/95 shadow-xl shadow-black/40 backdrop-blur-xl sm:bottom-4 sm:left-auto sm:right-4 sm:w-80">
          <button
            type="button"
            onClick={() => setCarritoAbierto((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3"
          >
            <span className="text-sm font-bold text-white">
              Tu selección · {seleccionList.length}/{MAX_BUTACAS}
            </span>
            <span className="flex items-center gap-2 text-sm font-bold text-[#f4c94f]">
              Bs {total}
              {carritoAbierto ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </span>
          </button>

          {carritoAbierto && (
            <div className="max-h-[60vh] overflow-y-auto px-4 pb-4">
              {aviso && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-[#e11d2e]/30 bg-[#e11d2e]/10 px-3 py-2 text-xs text-[#ff8b96]">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  {aviso}
                </div>
              )}

              {seleccionList.length === 0 ? (
                <p className="py-4 text-center text-sm text-white/40">
                  Tocá un asiento disponible en el mapa para elegirlo.
                </p>
              ) : (
                <ul className="mb-3 flex flex-col gap-2">
                  {seleccionList.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-[color:var(--bg-card-hover)] px-3 py-2 text-sm"
                    >
                      <span className="text-white/80">
                        Sector {b.sectorLabel} · {b.codigo}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-white/50">Bs {PRECIOS[b.nivel]}</span>
                        <button
                          type="button"
                          onClick={() => toggleButaca(b)}
                          className="text-white/40 transition-colors hover:text-[#ff4d5e]"
                          aria-label="Quitar butaca"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {seleccionList.length > 0 && (
                <div className="mb-4 flex flex-col gap-1 border-t border-[color:var(--border)] pt-3 text-sm">
                  {(Object.keys(NIVEL_LABEL) as NivelPrecio[])
                    .filter((nivel) => conteoPorNivel[nivel])
                    .map((nivel) => (
                      <div key={nivel} className="flex justify-between text-white/60">
                        <span>
                          {NIVEL_LABEL[nivel]} × {conteoPorNivel[nivel]}
                        </span>
                        <span>Bs {(conteoPorNivel[nivel] ?? 0) * PRECIOS[nivel]}</span>
                      </div>
                    ))}
                </div>
              )}

              <button
                type="button"
                disabled={seleccionList.length === 0}
                className="w-full cursor-pointer rounded-lg bg-[#D52B1E] px-6 py-3 font-semibold text-white shadow-md shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:brightness-100"
              >
                Continuar con la compra
              </button>
              <p className="mt-2 text-center text-xs text-white/35">
                La confirmación de pago estará disponible próximamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
