'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Armchair,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Trash2,
  Ticket,
  X,
} from 'lucide-react';
import {
  generarMapaTeatro,
  NIVEL_COLOR,
  NIVEL_LABEL,
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

// No hay backend de reservas todavía, así que se guardan en localStorage del
// navegador — persiste entre recargas de esta misma máquina, nada más.
const RESERVAS_KEY = 'aquicanta_reservas_asientos';

interface Reserva {
  id: string;
  fecha: string;
  nombre: string;
  email: string;
  telefono: string;
  butacaIds: string[];
}

function leerReservas(): Reserva[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RESERVAS_KEY);
    return raw ? (JSON.parse(raw) as Reserva[]) : [];
  } catch {
    return [];
  }
}

type Pestana = 'reserva' | 'mis-asientos';

export default function ButacasPage() {
  const [pestana, setPestana] = useState<Pestana>('reserva');

  // Mapa generado una sola vez: sectores/aforos vienen del plano del teatro,
  // pero no hay todavía modelo de asientos en Prisma, así que la ocupación es
  // un mock determinístico (ver apps/web/src/lib/asientos.ts).
  const { butacas: butacasBase, zonas } = useMemo(() => generarMapaTeatro(), []);

  // Reservas guardadas en este navegador. Se leen recién en el cliente para
  // no romper la hidratación con localStorage.
  const [reservas, setReservas] = useState<Reserva[]>([]);
  useEffect(() => {
    setReservas(leerReservas());
  }, []);

  const idsReservados = useMemo(() => new Set(reservas.flatMap((r) => r.butacaIds)), [reservas]);

  const butacas = useMemo(
    () => butacasBase.map((b) => (idsReservados.has(b.id) ? { ...b, ocupada: true } : b)),
    [butacasBase, idsReservados]
  );
  const butacasPorId = useMemo(() => new Map(butacas.map((b) => [b.id, b])), [butacas]);

  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
  const [aviso, setAviso] = useState<string | null>(null);
  // Arranca minimizado (sobre todo pensando en mobile, donde tapa mapa) —
  // se abre solo cuando hay algo que mostrar (ver efecto más abajo).
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  const toggleButaca = (butaca: Butaca) => {
    setAviso(null);
    setSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(butaca.id)) {
        next.delete(butaca.id);
      } else {
        if (next.size >= MAX_BUTACAS) {
          setAviso(`Podés seleccionar un máximo de ${MAX_BUTACAS} butacas por reserva.`);
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

  // Alerta visible: apenas se elige el primer asiento (0 → 1+), el carrito
  // se abre solo para que la selección no pase desapercibida si estaba
  // minimizado. Después el usuario lo puede volver a cerrar sin que se
  // vuelva a abrir por cada asiento nuevo que agregue.
  const cantidadPrevia = useRef(0);
  useEffect(() => {
    if (cantidadPrevia.current === 0 && seleccionList.length > 0) {
      setCarritoAbierto(true);
    }
    cantidadPrevia.current = seleccionList.length;
  }, [seleccionList.length]);

  const conteoPorNivel = seleccionList.reduce(
    (acc, b) => {
      acc[b.nivel] = (acc[b.nivel] ?? 0) + 1;
      return acc;
    },
    {} as Record<NivelPrecio, number>
  );

  const confirmarReserva = (datos: { nombre: string; email: string; telefono: string }) => {
    const nueva: Reserva = {
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      ...datos,
      butacaIds: [...seleccionadas],
    };
    const actualizadas = [...leerReservas(), nueva];
    window.localStorage.setItem(RESERVAS_KEY, JSON.stringify(actualizadas));
    setReservas(actualizadas);
    setSeleccionadas(new Set());
  };

  const cancelarReserva = (id: string) => {
    const actualizadas = reservas.filter((r) => r.id !== id);
    window.localStorage.setItem(RESERVAS_KEY, JSON.stringify(actualizadas));
    setReservas(actualizadas);
  };

  return (
    <div className="flex h-dvh flex-col lg:h-[calc(100dvh-88px)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-4 sm:px-6">
        <div>
          <span className="badge badge-gold w-fit mb-2">
            <Armchair size={14} /> Teatro Internacional de Oruro
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-linear-to-r from-[#fdf6ec] via-[#f4c94f] to-[#ff4d5e] bg-clip-text text-transparent">
            Butacas
          </h1>
        </div>

        {pestana === 'reserva' && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_SELECCIONADO }} />
              Seleccionado
            </span>
            <span className="inline-flex items-center gap-1.5 opacity-70">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_OCUPADO }} />
              Ocupado
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-1.5 px-4 pb-3 sm:px-6">
        {(
          [
            { id: 'reserva', label: 'Reserva de Asientos', icon: Armchair },
            { id: 'mis-asientos', label: 'Mis asientos', icon: Ticket },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPestana(id)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              pestana === id
                ? 'border-[#e0a527]/40 bg-[#e0a527]/15 text-[#f4c94f]'
                : 'border-transparent text-white/50 hover:bg-white/6 hover:text-white/80'
            }`}
          >
            <Icon size={15} />
            {label}
            {id === 'mis-asientos' && reservas.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e0a527]/20 px-1 text-[11px] font-bold text-[#f4c94f]">
                {reservas.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {pestana === 'reserva' ? (
        <div className="relative mx-2 mb-2 min-h-0 flex-1 overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card) sm:mx-4 sm:mb-4">
          <TeatroSeatMap butacas={butacas} zonas={zonas} seleccionadas={seleccionadas} onToggle={toggleButaca} />

          {/* Carrito flotante: no ocupa columna propia para no achicar el mapa. Cuando
              está minimizado con algo elegido, se resalta con un anillo rojo — y la
              medallita del ícono pulsa — para que la selección no pase desapercibida. */}
          <div
            className={`absolute bottom-3 left-3 right-3 z-10 flex max-h-[75%] flex-col overflow-hidden rounded-2xl border border-[#e0a527]/25 bg-[#170406]/95 shadow-xl shadow-black/40 backdrop-blur-xl transition-shadow duration-300 sm:bottom-4 sm:left-auto sm:right-4 sm:w-96 ${
              !carritoAbierto && seleccionList.length > 0 ? 'ring-2 ring-[#ff4d5e]/70' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => setCarritoAbierto((v) => !v)}
              className="flex w-full shrink-0 items-center justify-between gap-3 px-4 py-3"
            >
              <span className="flex items-center gap-2.5">
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e0a527]/15 text-[#f4c94f]">
                  <Armchair size={17} />
                  {!carritoAbierto && seleccionList.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-[#ff4d5e] text-[10px] font-bold text-white">
                      {seleccionList.length}
                    </span>
                  )}
                </span>
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-sm font-bold text-white">Tu selección</span>
                  <span className="text-[11px] text-white/45">
                    {seleccionList.length}/{MAX_BUTACAS} butacas
                  </span>
                </span>
              </span>
              {carritoAbierto ? (
                <ChevronDown size={16} className="text-white/50" />
              ) : (
                <ChevronUp size={16} className="text-white/50" />
              )}
            </button>

            <div className="h-1 w-full shrink-0 bg-white/5">
              <div
                className="h-full bg-linear-to-r from-[#e0a527] to-[#ff4d5e] transition-[width] duration-300"
                style={{ width: `${(seleccionList.length / MAX_BUTACAS) * 100}%` }}
              />
            </div>

            {carritoAbierto && (
              <>
                {aviso && (
                  <div className="mx-4 mt-3 flex shrink-0 items-start gap-2 rounded-lg border border-[#e11d2e]/30 bg-[#e11d2e]/10 px-3 py-2 text-xs text-[#ff8b96]">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    {aviso}
                  </div>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                  {seleccionList.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/30">
                        <Armchair size={18} />
                      </span>
                      <p className="max-w-55 text-sm text-white/40">
                        Tocá un asiento disponible en el mapa para elegirlo.
                      </p>
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {seleccionList.map((b) => (
                        <li
                          key={b.id}
                          className="group flex items-center justify-between gap-2 rounded-lg bg-white/4 px-3 py-2 text-sm transition-colors hover:bg-white/8"
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: NIVEL_COLOR[b.nivel] }}
                            />
                            <span className="truncate text-white/80">
                              <span className="font-semibold text-white">{b.sectorLabel}</span> · {b.codigo}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleButaca(b)}
                            className="shrink-0 text-white/30 transition-colors hover:text-[#ff4d5e] group-hover:text-white/50"
                            aria-label="Quitar butaca"
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="shrink-0 border-t border-(--border) bg-black/20 px-4 pt-3 pb-4">
                  {seleccionList.length > 0 && (
                    <div className="mb-3 flex flex-col gap-1 text-sm">
                      {(Object.keys(NIVEL_LABEL) as NivelPrecio[])
                        .filter((nivel) => conteoPorNivel[nivel])
                        .map((nivel) => (
                          <div key={nivel} className="flex items-center gap-1.5 text-white/60">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: NIVEL_COLOR[nivel] }}
                            />
                            {NIVEL_LABEL[nivel]} × {conteoPorNivel[nivel]}
                          </div>
                        ))}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={seleccionList.length === 0}
                    onClick={() => setModalAbierto(true)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#D52B1E] px-6 py-3 font-semibold text-white shadow-md shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:brightness-100"
                  >
                    Reservar asientos
                    <ArrowRight size={16} />
                  </button>
                  <p className="mt-2 text-center text-xs text-white/35">
                    Esto es una reserva, no un pago — la confirmación estará disponible próximamente.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <MisAsientos reservas={reservas} butacasPorId={butacasPorId} onCancelar={cancelarReserva} />
      )}

      {modalAbierto && (
        <ModalReserva seleccionList={seleccionList} onClose={() => setModalAbierto(false)} onConfirmar={confirmarReserva} />
      )}
    </div>
  );
}

function MisAsientos({
  reservas,
  butacasPorId,
  onCancelar,
}: {
  reservas: Reserva[];
  butacasPorId: Map<string, Butaca>;
  onCancelar: (id: string) => void;
}) {
  const ordenadas = [...reservas].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="mx-2 mb-2 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-(--border) bg-(--bg-card) p-4 sm:mx-4 sm:mb-4 sm:p-6">
      {ordenadas.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white/30">
            <Ticket size={24} />
          </span>
          <p className="max-w-72 text-sm text-white/40">
            Todavía no reservaste ningún asiento. Andá a "Reserva de Asientos" para elegir los tuyos.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ordenadas.map((r) => {
            const asientos = r.butacaIds.map((id) => butacasPorId.get(id)).filter((b): b is Butaca => Boolean(b));
            const fecha = new Date(r.fecha).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' });

            return (
              <div key={r.id} className="flex flex-col gap-3 rounded-xl border border-(--border) bg-white/4 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{r.nombre}</p>
                    <p className="text-xs text-white/45">{r.email}</p>
                  </div>
                  <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-white/50">
                    <Calendar size={11} />
                    {fecha}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {asientos.map((b) => (
                    <span
                      key={b.id}
                      className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-xs text-white/70"
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: NIVEL_COLOR[b.nivel] }} />
                      {b.sectorLabel} · {b.codigo}
                    </span>
                  ))}
                </div>

                <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-xs text-white/45">
                    {asientos.length} butaca{asientos.length === 1 ? '' : 's'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onCancelar(r.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#ff4d5e]/80 transition-colors hover:text-[#ff4d5e]"
                  >
                    <Trash2 size={13} />
                    Cancelar reserva
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ModalReserva({
  seleccionList,
  onClose,
  onConfirmar,
}: {
  seleccionList: Butaca[];
  onClose: () => void;
  onConfirmar: (datos: { nombre: string; email: string; telefono: string }) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Cuántas butacas se confirmaron, capturado en el momento del submit — el
  // padre vacía la selección apenas confirma, así que seleccionList.length
  // ya sería 0 para cuando se pinta la pantalla de éxito.
  const [cantidadConfirmada, setCantidadConfirmada] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) {
      setError('Completá tu nombre y email para reservar.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Ese email no parece válido.');
      return;
    }
    setError(null);
    onConfirmar({ nombre: nombre.trim(), email: email.trim(), telefono: telefono.trim() });
    setCantidadConfirmada(seleccionList.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#e0a527]/25 bg-[#1f0508] shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {cantidadConfirmada !== null ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#10b981]/15 text-[#10b981]">
              <Check size={28} />
            </span>
            <h2 className="text-lg font-bold text-white">¡Reserva confirmada!</h2>
            <p className="max-w-72 text-sm text-white/60">
              Guardamos tu reserva de {cantidadConfirmada} butaca{cantidadConfirmada === 1 ? '' : 's'} en este
              navegador. Te vamos a contactar por email para los próximos pasos.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full cursor-pointer rounded-lg bg-[#D52B1E] px-6 py-2.5 font-semibold text-white transition-colors hover:brightness-110"
            >
              Listo
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-(--border) px-5 py-4">
              <h2 className="text-base font-bold text-white">Confirmar reserva</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="text-white/40 transition-colors hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto border-b border-(--border) px-5 py-3">
              <ul className="flex flex-wrap gap-1.5">
                {seleccionList.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-xs text-white/70"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: NIVEL_COLOR[b.nivel] }} />
                    {b.sectorLabel} · {b.codigo}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-5 py-4">
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-[#e11d2e]/30 bg-[#e11d2e]/10 px-3 py-2 text-xs text-[#ff8b96]">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-white/70">Nombre completo</span>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. María Pérez"
                  className="rounded-lg border border-(--border) bg-white/5 px-3 py-2 text-white placeholder:text-white/30 outline-none focus:border-[#e0a527]/60"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-white/70">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vos@ejemplo.com"
                  className="rounded-lg border border-(--border) bg-white/5 px-3 py-2 text-white placeholder:text-white/30 outline-none focus:border-[#e0a527]/60"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-white/70">Teléfono (opcional)</span>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 700 00000"
                  className="rounded-lg border border-(--border) bg-white/5 px-3 py-2 text-white placeholder:text-white/30 outline-none focus:border-[#e0a527]/60"
                />
              </label>

              <button
                type="submit"
                className="mt-1 w-full cursor-pointer rounded-lg bg-[#D52B1E] px-6 py-2.5 font-semibold text-white transition-colors hover:brightness-110"
              >
                Confirmar reserva
              </button>
              <p className="text-center text-xs text-white/35">Se guarda solo en este navegador, todavía no hay backend.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
