'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, ChevronDown, ChevronUp, Lock, Sparkles, Users, X } from 'lucide-react';
import { useVisitorId } from '@/hooks/useVisitorId';
import { useUsuario } from '@/hooks/useUsuario';
import { fetchVisitante } from '@/lib/authVisitante';
import { EscanerQRCliente } from './EscanerQRCliente';
import { IniciaTuAventura } from './IniciaTuAventura';
import { TarjetaBienvenida } from './TarjetaBienvenida';
import { RielProgreso } from './RielProgreso';
import { MedallasRango } from './MedallasRango';
import { MisEstadisticas } from './MisEstadisticas';

// Sello por defecto mientras los puntos no tengan una imagen propia cargada
// (`PuntoEscaneo.imagenUrl`) — se muestra en el modal de "sello conseguido".
const SELLO_GENERICO_URL = '/sellos/sello-generico.png';

interface PuntoProgreso {
  id: string;
  nombre: string | null;
  imagenUrl: string | null;
  escaneado: boolean;
}

interface GrupoProgreso {
  instancia: string | null;
  completo: boolean;
  puntos: PuntoProgreso[];
}

interface EventoProgreso {
  id: string;
  nombre: string;
  orden: number;
  imagenUrl: string | null;
  completado: boolean;
  grupos: GrupoProgreso[];
}

interface RangoProgreso {
  id: string;
  nombre: string;
  orden: number;
  alcanzado: boolean;
}

interface MedallaProgreso {
  id: string;
  nombre: string;
  descripcion: string;
  umbral: number;
  alcanzada: boolean;
}

interface TrayectoProgreso {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagenUrl: string | null;
  completo: boolean;
  eventos: EventoProgreso[];
  rangos: RangoProgreso[];
  // null = el admin no activó mostrar este dato para este trayecto.
  visitantesUnicos: number | null;
}

interface ResultadoEscaneo {
  punto: { id: string; nombre: string | null; imagenUrl: string | null };
  yaExistia: boolean;
  evento: { id: string; nombre: string; imagenUrl: string | null; completado: boolean };
  trayecto: { id: string; nombre: string; imagenUrl: string | null; completo: boolean };
  rangos: RangoProgreso[];
}

interface TrayectoBasico {
  id: string;
  nombre: string;
  descripcion: string | null;
}

interface PasaportePageProps {
  trayectos: TrayectoBasico[];
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// El rango de mayor `orden` es el que corresponde a completar todo el
// trayecto (ej. "Coleccionista") — se calcula así, en vez de hardcodear un
// nombre, para que sirva igual con cualquier trayecto/evento futuro.
function rangoMasAlto(rangos: RangoProgreso[]): RangoProgreso | null {
  return rangos.length > 0 ? rangos.reduce((max, r) => (r.orden > max.orden ? r : max), rangos[0]) : null;
}

function BarraProgreso({ porcentaje, tono = 'green' }: { porcentaje: number; tono?: 'green' | 'blue' }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-(--border)">
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${
          tono === 'green' ? 'bg-(--accent-green)' : 'bg-(--accent-blue)'
        }`}
        style={{ width: `${porcentaje}%` }}
      />
    </div>
  );
}

// La colección visual de un grupo: un sello por punto, con la imagen real una
// vez conseguido (o el sello genérico si ese punto todavía no tiene arte
// propio) y una silueta bloqueada mientras falte por escanear.
function ColeccionSellos({ puntos }: { puntos: PuntoProgreso[] }) {
  return (
    <div className="grid grid-cols-2 gap-3!">
      {puntos.map((punto) => (
        <div
          key={punto.id}
          title={punto.nombre ?? undefined}
          className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-2 ${
            punto.escaneado ? 'border-(--accent-gold) bg-(--bg-card)' : 'border-dashed border-(--border) bg-(--bg-card-hover)'
          }`}
        >
          {punto.escaneado ? (
            <Image
              src={punto.imagenUrl ?? SELLO_GENERICO_URL}
              alt={punto.nombre ?? 'Sello conseguido'}
              fill
              sizes="120px"
              className="object-cover"
              // La imagen de un punto la carga el admin como una URL externa
              // cualquiera — `unoptimized` evita que rompa toda la página
              // cuando el dominio no está en next.config.ts (no se puede
              // pedir de antemano que precargue cada dominio posible).
              unoptimized={Boolean(punto.imagenUrl)}
            />
          ) : (
            <Lock className="text-(--text-muted)" size={20} />
          )}
        </div>
      ))}
    </div>
  );
}

// La tarjeta de Recorrido de UN trayecto: banner de completo (si aplica),
// eventos/puntos colapsables y sus estadísticas — todo lo que SÍ es
// específico de ese trayecto (a diferencia de Bienvenida/Riel/Medallas, que
// son generales y se pintan una sola vez en el padre).
function RecorridoTrayecto({ progreso }: { progreso: TrayectoProgreso }) {
  // Arranca cerrado: lo primero que se ve de un trayecto es su imagen y
  // descripción (contexto), y recién al abrir aparecen los eventos y la
  // colección de estampillas — nunca las dos cosas a la vez.
  const [eventosAbiertos, setEventosAbiertos] = useState(false);

  const totalEventos = progreso.eventos.length;
  const eventosCompletados = progreso.eventos.filter((e) => e.completado).length;
  const rangoFinal = rangoMasAlto(progreso.rangos);
  const todosLosPuntos = progreso.eventos.flatMap((e) => e.grupos.flatMap((g) => g.puntos));

  return (
    <div>
      {progreso.completo && (
        <div className="glass-panel mb-8! flex items-center gap-4! rounded-2xl! border-(--border-active)! p-6!">
          <Sparkles className="shrink-0 text-(--accent-gold)" size={32} />
          <div>
            <p className="font-bold text-(--text-primary)">
              {rangoFinal ? `¡Ahora eres ${rangoFinal.nombre}!` : '¡Trayecto completo!'}
            </p>
            <p className="text-sm text-(--text-secondary)">Conseguiste todos los sellos de &quot;{progreso.nombre}&quot;.</p>
          </div>
        </div>
      )}

      <div className="glass-panel rounded-2xl! p-5!">
        <button
          onClick={() => setEventosAbiertos((v) => !v)}
          className="flex w-full items-center justify-between gap-4! text-left"
        >
          <h2 className="text-xl font-bold text-(--text-primary)">{progreso.nombre}</h2>
          <div className="flex shrink-0 items-center gap-3!">
            <span className="text-sm text-(--text-secondary)">
              {eventosCompletados}/{totalEventos}
            </span>
            {eventosAbiertos ? (
              <ChevronUp className="text-(--text-muted)" size={20} />
            ) : (
              <ChevronDown className="text-(--text-muted)" size={20} />
            )}
          </div>
        </button>

        {/* La descripción (y el conteo de visitantes) queda siempre visible,
            esté abierto o cerrado — es el contexto fijo del trayecto. */}
        {(progreso.descripcion || progreso.visitantesUnicos !== null) && (
          <div className="mt-2!">
            {progreso.descripcion && <p className="text-sm text-(--text-secondary)">{progreso.descripcion}</p>}
            {progreso.visitantesUnicos !== null && (
              <p className="mt-1.5! flex items-center gap-1.5 text-sm text-(--text-secondary)">
                <Users size={14} />
                {progreso.visitantesUnicos} {progreso.visitantesUnicos === 1 ? 'persona escaneó' : 'personas escanearon'} este
                recorrido
              </p>
            )}
          </div>
        )}

        {/* Al abrir: imagen (solo desktop, en mobile ocupaba demasiado
            espacio), lista de eventos y colección de estampillas — las 3
            juntas, en fila en desktop y apiladas en mobile (sin la imagen). */}
        {eventosAbiertos && (
          <div className="mt-5! grid grid-cols-1 gap-6! border-t border-(--border) pt-5! sm:grid-cols-[auto_1fr_auto]">
            {progreso.imagenUrl && (
              <Image
                src={progreso.imagenUrl}
                alt={progreso.nombre}
                width={160}
                height={160}
                className="hidden aspect-square w-40 shrink-0 rounded-xl object-cover sm:block"
                unoptimized
              />
            )}

            {/* Columna de eventos: cada uno con sus grupos (texto + barra) */}
            <div className="flex flex-col gap-5!">
              {progreso.eventos.map((evento) => (
                <div key={evento.id}>
                  <div className="mb-2! flex items-center gap-2!">
                    <p className="font-bold text-(--text-primary)">{evento.nombre}</p>
                    {evento.completado ? (
                      <CheckCircle2 className="shrink-0 text-(--accent-green)" size={14} />
                    ) : (
                      <Lock className="shrink-0 text-(--text-muted)" size={13} />
                    )}
                  </div>

                  <div className="flex flex-col gap-3!">
                    {evento.grupos.map((grupo, i) => {
                      const escaneados = grupo.puntos.filter((p) => p.escaneado).length;
                      const total = grupo.puntos.length;
                      const porcentaje = total > 0 ? Math.round((escaneados / total) * 100) : 0;
                      // Con un solo punto sin instancia, se usa su propio
                      // nombre como etiqueta (ej. "Punto de escaneo en la
                      // clausura") en vez del genérico "Puntos de escaneo".
                      const etiqueta =
                        grupo.instancia ?? (grupo.puntos.length === 1 ? grupo.puntos[0].nombre : null) ?? 'Puntos de escaneo';
                      return (
                        <div key={grupo.instancia ?? i} className="flex items-center gap-3!">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2! text-sm">
                              <span className="truncate text-(--text-secondary)">{etiqueta}</span>
                              <span className={grupo.completo ? 'font-semibold text-(--accent-green)' : 'text-(--text-muted)'}>
                                {escaneados}/{total}
                              </span>
                            </div>
                            <BarraProgreso porcentaje={porcentaje} tono={grupo.completo ? 'green' : 'blue'} />
                          </div>
                          {grupo.completo ? (
                            <CheckCircle2 className="shrink-0 text-(--accent-green)" size={16} />
                          ) : (
                            <Lock className="shrink-0 text-(--text-muted)" size={16} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Columna de estampillas: colección completa del trayecto */}
            <div className="sm:w-52">
              <ColeccionSellos puntos={todosLosPuntos} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PasaportePage({ trayectos }: PasaportePageProps) {
  const visitorIdAnonimo = useVisitorId();
  const { usuario, cargando: cargandoUsuario, loginConGoogle } = useUsuario();
  // Una vez logueado, todo el pasaporte pasa a usar el id real de la cuenta
  // en vez del UUID anónimo — ver el efecto de "vincular" más abajo, que
  // fusiona el progreso que haya quedado bajo el UUID anónimo.
  const visitorId = usuario?.id ?? visitorIdAnonimo;
  const vinculadoRef = useRef(false);
  const [progresos, setProgresos] = useState<Record<string, TrayectoProgreso>>({});
  const [medallasGlobales, setMedallasGlobales] = useState<MedallaProgreso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [escaneando, setEscaneando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoEscaneo | null>(null);
  const [errorEscaneo, setErrorEscaneo] = useState<string | null>(null);
  // Cambia en cada escaneo para forzar el remount del sello y así la animación
  // de caída se repita, incluso si se vuelve a escanear el mismo punto.
  const resultadoSeqRef = useRef(0);

  // Un solo escáner para todos los trayectos: el código no dice a cuál
  // pertenece hasta que la API lo resuelve, así que al confirmar un escaneo
  // se refresca el progreso de TODOS (no solo el que estaba abierto), por si
  // el punto escaneado pertenece a otro trayecto que este visitante también
  // sigue — y también las medallas globales, porque cuentan sellos de
  // cualquier trayecto.
  const cargarProgresos = useCallback(async () => {
    if (!visitorId) return;
    try {
      const [resultados, medallas] = await Promise.all([
        Promise.all(
          trayectos.map((t) =>
            fetch(`${apiUrl}/sellos/trayectos/${t.id}/progreso/${visitorId}`, { cache: 'no-store' }).then((res) =>
              res.ok ? (res.json() as Promise<TrayectoProgreso>) : null,
            ),
          ),
        ),
        fetch(`${apiUrl}/sellos/medallas/${visitorId}`, { cache: 'no-store' }).then((res) =>
          res.ok ? (res.json() as Promise<MedallaProgreso[]>) : [],
        ),
      ]);
      const mapa: Record<string, TrayectoProgreso> = {};
      trayectos.forEach((t, i) => {
        const p = resultados[i];
        if (p) mapa[t.id] = p;
      });
      setProgresos(mapa);
      setMedallasGlobales(medallas);
    } catch {
      // Sin conexión: el pasaporte simplemente no se actualiza, se reintenta
      // en el próximo escaneo o recarga de página.
    } finally {
      setCargando(false);
    }
  }, [trayectos, visitorId]);

  useEffect(() => {
    cargarProgresos();
  }, [cargarProgresos]);

  // Al pasar de anónimo a logueado, fusiona el progreso que haya quedado
  // bajo el UUID anónimo con la cuenta real — una sola vez por sesión
  // (vinculadoRef), y solo cuando realmente hay algo que fusionar (un
  // usuario recién creado y este UUID anónimo son distintos).
  useEffect(() => {
    if (!usuario || !visitorIdAnonimo || vinculadoRef.current) return;
    if (usuario.id === visitorIdAnonimo) return;
    vinculadoRef.current = true;

    fetchVisitante('/sellos/vincular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorIdAnonimo }),
    })
      .then(() => cargarProgresos())
      .catch(() => {
        // Si falla, el progreso anónimo simplemente queda sin fusionar por
        // ahora — no es crítico, el visitante puede seguir usando su cuenta.
      });
  }, [usuario, visitorIdAnonimo, cargarProgresos]);

  // `handleDetectado` a propósito NO llama a `cargarProgresos` — se hace
  // recién acá, al cerrar el modal de "sello conseguido", para que el
  // visitante pueda VER al tren moverse en el Riel en vez de que ya esté en
  // su posición nueva (detrás del modal) desde antes de cerrarlo.
  const cerrarResultado = useCallback(() => {
    setResultado(null);
    cargarProgresos();
  }, [cargarProgresos]);

  useEffect(() => {
    if (!resultado) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarResultado();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [resultado, cerrarResultado]);

  const handleDetectado = useCallback(
    async (codigo: string) => {
      setEscaneando(false);
      if (!visitorId) return;

      try {
        const res = await fetch(`${apiUrl}/sellos/escanear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigo, visitorId }),
        });

        if (!res.ok) {
          setErrorEscaneo('Ese código no corresponde a ningún punto de este recorrido.');
          return;
        }

        const data: ResultadoEscaneo = await res.json();
        resultadoSeqRef.current += 1;
        setResultado(data);
      } catch {
        setErrorEscaneo('No pudimos registrar el escaneo. Intenta de nuevo.');
      }
    },
    [visitorId],
  );

  // Antes de mostrar nada del pasaporte (bienvenida/riel/medallas y las
  // tarjetas de cada trayecto), hay que saber si hay sesión — sin login no
  // se entra al "juego" ni en mobile ni en desktop.
  if (cargandoUsuario) {
    return null;
  }

  if (!usuario) {
    return (
      <div className="sellos-cafe mt-12!">
        <IniciaTuAventura onLoginGoogle={() => loginConGoogle()} />
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="mt-12! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
        Cargando tu pasaporte…
      </div>
    );
  }

  // "Mis estadísticas", los pills de Rango de la Bienvenida, el Riel y las
  // Medallas son información GENERAL del visitante — se agregan across TODOS
  // los trayectos que sigue (o, en el caso del Riel/Medallas, directamente
  // no dependen de ningún trayecto en particular, ver `medallasGlobales`).
  //
  // "Trayectos visitados" cuenta TRAYECTOS (frikicon, Recorrido de Prueba...),
  // no los Eventos internos de cada uno (Apertura, Feria de Stands...) — esos
  // ya se ven dentro de la propia tarjeta de Recorrido de cada trayecto. Un
  // trayecto cuenta como "visitado" con al menos 1 sello escaneado ahí,
  // aunque no esté completo todavía.
  const todosLosProgresos = Object.values(progresos);
  const totalTrayectos = trayectos.length;
  const trayectosVisitados = todosLosProgresos.filter((p) =>
    p.eventos.some((e) => e.grupos.some((g) => g.puntos.some((punto) => punto.escaneado))),
  ).length;
  const totalPuntos = todosLosProgresos.reduce(
    (acc, p) => acc + p.eventos.flatMap((e) => e.grupos.flatMap((g) => g.puntos)).length,
    0,
  );
  const sellosEscaneados = todosLosProgresos.reduce(
    (acc, p) => acc + p.eventos.flatMap((e) => e.grupos.flatMap((g) => g.puntos)).filter((punto) => punto.escaneado).length,
    0,
  );
  // Rangos combinados de TODOS los trayectos — ya no hay un "principal" del
  // que elegir cuáles mostrar en los pills de la Bienvenida.
  const todosLosRangos = todosLosProgresos.flatMap((p) => p.rangos);
  const rangosAlcanzados = todosLosRangos.filter((r) => r.alcanzado).length;
  // El Riel representa el mismo progreso "general" que las Medallas — sus
  // paradas son los umbrales de sellos, no los eventos de un trayecto en
  // particular. Se reutiliza RielProgreso tal cual (misma forma de datos).
  const paradasRiel = medallasGlobales.map((medalla, i) => ({
    id: medalla.id,
    nombre: medalla.nombre,
    orden: i,
    completado: medalla.alcanzada,
  }));

  return (
    <div className="sellos-cafe mt-12!">
      {/* La tarjeta de bienvenida (perfil de jugador) sí se ve en desktop
          también — solo su botón "Escanear" queda oculto ahí (ver
          TarjetaBienvenida), porque escanear un QR es una acción de celular. */}
      <div className="mb-8!">
        <TarjetaBienvenida
          rangos={todosLosRangos}
          usuario={usuario}
          onEscanear={() => {
            setErrorEscaneo(null);
            setEscaneando(true);
          }}
        />
      </div>

      {/* Riel, medallas y estadísticas sí quedan solo para mobile — son el
          detalle del progreso de escaneo, que en desktop no tiene con qué
          interactuar. Las tarjetas de cada trayecto de más abajo sí siguen
          visibles en desktop. */}
      <div className="md:hidden">
        <div className="mb-8!">
          <RielProgreso eventos={paradasRiel} />
        </div>

        <div className="mb-8!">
          <MedallasRango medallas={medallasGlobales} />
        </div>

        <div className="mb-8!">
          <MisEstadisticas
            items={[
              { etiqueta: 'Trayectos visitados', actual: trayectosVisitados, total: totalTrayectos },
              { etiqueta: 'Sellos escaneados', actual: sellosEscaneados, total: totalPuntos },
              { etiqueta: 'Rangos desbloqueados', actual: rangosAlcanzados, total: todosLosRangos.length },
            ]}
          />
        </div>
      </div>

      {trayectos.map((t, i) => {
        const progreso = progresos[t.id];
        if (!progreso) return null;
        return (
          <div key={t.id} className={i > 0 ? 'mt-16! border-t border-(--border) pt-16!' : ''}>
            <RecorridoTrayecto progreso={progreso} />
          </div>
        );
      })}

      {escaneando && <EscanerQRCliente onDetectado={handleDetectado} onCerrar={() => setEscaneando(false)} />}

      {resultado && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-6!"
          onClick={cerrarResultado}
        >
          <div className="glass-panel w-full max-w-md rounded-2xl! p-8! text-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={cerrarResultado}
              className="ml-auto! flex h-9 w-9 items-center justify-center rounded-full border border-(--border) text-(--text-secondary) hover:bg-(--bg-card-hover)"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
            <div key={resultadoSeqRef.current} className="relative mx-auto! mb-4! flex h-72 w-72 items-center justify-center">
              <span className="sello-onda pointer-events-none absolute h-64 w-64 rounded-full border-4 border-(--accent-gold)" />
              <Image
                src={resultado.punto.imagenUrl ?? SELLO_GENERICO_URL}
                alt="Sello conseguido"
                width={320}
                height={320}
                className="sello-caida relative h-64 w-64 object-contain drop-shadow-xl"
                unoptimized={Boolean(resultado.punto.imagenUrl)}
              />
            </div>
            <p className="font-bold text-(--text-primary)">
              {resultado.yaExistia ? 'Ya tenías este sello' : '¡Sello conseguido!'}
            </p>
            <p className="mt-1! text-sm text-(--text-secondary)">{resultado.punto.nombre ?? resultado.evento.nombre}</p>
            {resultado.evento.completado && !resultado.yaExistia && (
              <p className="mt-3! text-sm font-semibold text-(--accent-green)">Evento &quot;{resultado.evento.nombre}&quot; completado</p>
            )}
            {resultado.trayecto.completo && (
              <p className="mt-1! text-sm font-semibold text-(--accent-gold)">
                {rangoMasAlto(resultado.rangos) ? `¡Ahora eres ${rangoMasAlto(resultado.rangos)!.nombre}!` : '¡Trayecto completo!'}
              </p>
            )}
            <button
              onClick={cerrarResultado}
              className="mt-6! inline-flex w-full items-center justify-center rounded-full bg-(--text-primary) px-5! py-2.5! text-sm font-bold tracking-wide text-white uppercase transition-opacity hover:opacity-90"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {errorEscaneo && (
        <div className="fixed inset-x-0 bottom-20 z-[70] mx-auto! w-fit rounded-lg bg-(--text-primary) px-4! py-2.5! text-sm text-white shadow-lg lg:bottom-6">
          {errorEscaneo}
          <button onClick={() => setErrorEscaneo(null)} className="ml-3! font-semibold underline">
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
