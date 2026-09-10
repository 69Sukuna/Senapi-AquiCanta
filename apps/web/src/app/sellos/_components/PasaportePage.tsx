'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, CheckCircle2, Lock, Sparkles, X } from 'lucide-react';
import { useVisitorId } from '@/hooks/useVisitorId';
import { EscanerQRCliente } from './EscanerQRCliente';

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

interface TrayectoProgreso {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagenUrl: string | null;
  completo: boolean;
  eventos: EventoProgreso[];
  rangos: RangoProgreso[];
}

interface ResultadoEscaneo {
  punto: { id: string; nombre: string | null; imagenUrl: string | null };
  yaExistia: boolean;
  evento: { id: string; nombre: string; imagenUrl: string | null; completado: boolean };
  trayecto: { id: string; nombre: string; imagenUrl: string | null; completo: boolean };
  rangos: RangoProgreso[];
}

interface PasaportePageProps {
  trayectoId: string;
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
    <div className="flex flex-wrap gap-2!">
      {puntos.map((punto) => (
        <div
          key={punto.id}
          title={punto.nombre ?? undefined}
          className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 ${
            punto.escaneado ? 'border-(--accent-gold) bg-(--bg-card)' : 'border-dashed border-(--border) bg-(--bg-card-hover)'
          }`}
        >
          {punto.escaneado ? (
            <Image
              src={punto.imagenUrl ?? SELLO_GENERICO_URL}
              alt={punto.nombre ?? 'Sello conseguido'}
              width={44}
              height={44}
              className="h-full w-full object-contain"
            />
          ) : (
            <Lock className="text-(--text-muted)" size={16} />
          )}
        </div>
      ))}
    </div>
  );
}

export function PasaportePage({ trayectoId }: PasaportePageProps) {
  const visitorId = useVisitorId();
  const [progreso, setProgreso] = useState<TrayectoProgreso | null>(null);
  const [cargando, setCargando] = useState(true);
  const [escaneando, setEscaneando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoEscaneo | null>(null);
  const [errorEscaneo, setErrorEscaneo] = useState<string | null>(null);
  // Cambia en cada escaneo para forzar el remount del sello y así la animación
  // de caída se repita, incluso si se vuelve a escanear el mismo punto.
  const resultadoSeqRef = useRef(0);

  const cargarProgreso = useCallback(async () => {
    if (!visitorId) return;
    try {
      const res = await fetch(`${apiUrl}/sellos/trayectos/${trayectoId}/progreso/${visitorId}`, { cache: 'no-store' });
      if (res.ok) setProgreso(await res.json());
    } catch {
      // Sin conexión: el pasaporte simplemente no se actualiza, se reintenta
      // en el próximo escaneo o recarga de página.
    } finally {
      setCargando(false);
    }
  }, [trayectoId, visitorId]);

  useEffect(() => {
    cargarProgreso();
  }, [cargarProgreso]);

  useEffect(() => {
    if (!resultado) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setResultado(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [resultado]);

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
        await cargarProgreso();
      } catch {
        setErrorEscaneo('No pudimos registrar el escaneo. Intenta de nuevo.');
      }
    },
    [visitorId, cargarProgreso],
  );

  if (cargando || !progreso) {
    return (
      <div className="mt-12! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
        Cargando tu pasaporte…
      </div>
    );
  }

  const totalEventos = progreso.eventos.length;
  const eventosCompletados = progreso.eventos.filter((e) => e.completado).length;
  const porcentajeTrayecto = totalEventos > 0 ? Math.round((eventosCompletados / totalEventos) * 100) : 0;
  const rangoFinal = rangoMasAlto(progreso.rangos);

  return (
    <div className="mt-12!">
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

      <div className="glass-panel mb-8! rounded-2xl! p-5!">
        <div className="flex items-center justify-between gap-3!">
          <span className="text-sm font-semibold text-(--text-primary)">Progreso del recorrido</span>
          <span className="text-sm font-semibold text-(--accent-green)">
            {eventosCompletados}/{totalEventos} eventos
          </span>
        </div>
        <div className="mt-3!">
          <BarraProgreso porcentaje={porcentajeTrayecto} />
        </div>
      </div>

      {progreso.rangos.length > 0 && (
        <div className="mb-10! flex flex-wrap gap-3!">
          {progreso.rangos.map((rango) => (
            <span
              key={rango.id}
              className={`badge ${rango.alcanzado ? 'badge-gold' : 'border border-(--border) text-(--text-muted)'}`}
            >
              {rango.alcanzado ? <CheckCircle2 size={14} /> : <Lock size={14} />}
              {rango.nombre}
            </span>
          ))}
        </div>
      )}

      <div className="mb-8! flex items-center justify-between gap-4!">
        <h2 className="text-xl font-bold text-(--text-primary)">Eventos del recorrido</h2>
        <button
          onClick={() => {
            setErrorEscaneo(null);
            setEscaneando(true);
          }}
          className="inline-flex shrink-0 items-center gap-2! rounded-lg bg-[#1e63b8] px-5! py-2.5! text-sm font-semibold text-white shadow-md shadow-[#1e63b8]/30 transition-all hover:bg-[#164a8c]"
        >
          <Camera size={16} />
          Escanear
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5! sm:grid-cols-2">
        {progreso.eventos.map((evento) => (
          <div key={evento.id} className="glass-panel rounded-2xl! p-5!">
            <div className="flex items-start justify-between gap-3!">
              <h3 className="font-bold text-(--text-primary)">{evento.nombre}</h3>
              {evento.completado ? (
                <CheckCircle2 className="shrink-0 text-(--accent-green)" size={20} />
              ) : (
                <Lock className="shrink-0 text-(--text-muted)" size={18} />
              )}
            </div>

            <div className="mt-4! flex flex-col gap-3!">
              {evento.grupos.map((grupo, i) => {
                const escaneados = grupo.puntos.filter((p) => p.escaneado).length;
                const total = grupo.puntos.length;
                const porcentaje = total > 0 ? Math.round((escaneados / total) * 100) : 0;
                return (
                  <div key={grupo.instancia ?? i} className="flex flex-col gap-1.5!">
                    <div className="flex items-center justify-between gap-2! text-sm">
                      <span className="text-(--text-secondary)">{grupo.instancia ?? 'Puntos de escaneo'}</span>
                      <span className={grupo.completo ? 'font-semibold text-(--accent-green)' : 'text-(--text-muted)'}>
                        {escaneados}/{total}
                      </span>
                    </div>
                    <BarraProgreso porcentaje={porcentaje} tono={grupo.completo ? 'green' : 'blue'} />
                    <div className="mt-1!">
                      <ColeccionSellos puntos={grupo.puntos} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {escaneando && <EscanerQRCliente onDetectado={handleDetectado} onCerrar={() => setEscaneando(false)} />}

      {resultado && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-6!"
          onClick={() => setResultado(null)}
        >
          <div className="glass-panel w-full max-w-md rounded-2xl! p-8! text-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setResultado(null)}
              className="ml-auto! flex h-9 w-9 items-center justify-center rounded-full border border-(--border) text-(--text-secondary) hover:bg-(--bg-card-hover)"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
            <div key={resultadoSeqRef.current} className="relative mx-auto! mb-4! flex h-72 w-72 items-center justify-center">
              <span className="sello-onda absolute h-64 w-64 rounded-full border-4 border-(--accent-gold)" />
              <Image
                src={resultado.punto.imagenUrl ?? SELLO_GENERICO_URL}
                alt="Sello conseguido"
                width={320}
                height={320}
                className="sello-caida relative h-64 w-64 object-contain drop-shadow-xl"
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
              onClick={() => setResultado(null)}
              className="mt-6! inline-flex w-full items-center justify-center rounded-lg bg-[#1e63b8] px-5! py-2.5! text-sm font-semibold text-white shadow-md shadow-[#1e63b8]/30 transition-all hover:bg-[#164a8c]"
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
