'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CircleCheck, CircleX, CircleHelp } from 'lucide-react';
import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';
import { ROUTES } from '@/lib/routes';

// Espeja la respuesta de POST /inscripciones/verificar — la API a propósito
// no devuelve nada más que esto (ni nombre, ni categoría, ni etapa).
type ResultadoVerificacion = 'INSCRITO' | 'RECHAZADO' | 'NO_INSCRITO';

const MENSAJES: Record<
  ResultadoVerificacion,
  { titulo: string; detalle: string; color: string; icon: typeof CircleCheck }
> = {
  INSCRITO: {
    titulo: 'Estás inscrito',
    detalle: 'Encontramos una postulación registrada con este carnet.',
    color: '#2e7d46',
    icon: CircleCheck,
  },
  RECHAZADO: {
    titulo: 'Inscripción rechazada',
    detalle: 'La postulación registrada con este carnet fue rechazada.',
    color: '#d52b1e',
    icon: CircleX,
  },
  NO_INSCRITO: {
    titulo: 'No encontramos una inscripción',
    detalle: 'No hay ninguna postulación registrada con este carnet.',
    color: '#e08f1f',
    icon: CircleHelp,
  },
};

function FormularioVerificacion() {
  const [ciNumero, setCiNumero] = useState('');
  const [resultado, setResultado] = useState<ResultadoVerificacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setResultado(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/inscripciones/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ciNumero: ciNumero.trim() }),
      });
      if (res.status === 429) {
        setError('Hiciste demasiadas consultas seguidas. Esperá un minuto e intentá de nuevo.');
        return;
      }
      if (!res.ok) throw new Error();
      const data: { estado: ResultadoVerificacion } = await res.json();
      setResultado(data.estado);
    } catch {
      setError('No pudimos verificar en este momento. Intentá de nuevo más tarde.');
    } finally {
      setCargando(false);
    }
  }

  const mensaje = resultado && MENSAJES[resultado];

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="flex flex-col gap-1 text-sm font-semibold text-(--text-secondary)">
          Número de carnet de identidad
          <input
            type="text"
            inputMode="numeric"
            value={ciNumero}
            onChange={(e) => {
              setCiNumero(e.target.value);
              setResultado(null);
            }}
            placeholder="Ej. 1234567"
            maxLength={20}
            required
            className="w-full rounded-xl border border-(--border) bg-white px-4! py-2.5! text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
          />
        </label>

        {error && <p className="text-sm font-semibold text-[#d52b1e]">{error}</p>}

        <button
          type="submit"
          disabled={cargando || !ciNumero.trim()}
          className="w-full rounded-full bg-[#1e63b8] px-5! py-2.5! text-sm font-bold text-white transition-opacity duration-200 disabled:opacity-40"
        >
          {cargando ? 'Verificando...' : 'Verificar'}
        </button>
      </form>

      {mensaje && (
        <div
          role="status"
          className="mt-6! flex items-start gap-3! rounded-xl border p-4!"
          style={{ borderColor: `${mensaje.color}40`, background: `${mensaje.color}0f` }}
        >
          <mensaje.icon size={22} className="mt-0.5! shrink-0" style={{ color: mensaje.color }} aria-hidden="true" />
          <div>
            <p className="font-bold" style={{ color: mensaje.color }}>
              {mensaje.titulo}
            </p>
            <p className="mt-0.5! text-sm text-(--text-secondary)">{mensaje.detalle}</p>
            {resultado === 'NO_INSCRITO' && (
              <Link
                href={ROUTES.inscripciones}
                className="mt-2! inline-block text-sm font-semibold text-[#1e63b8]! underline underline-offset-2"
              >
                Ir al formulario de inscripción
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function VerificaInscripcionPage() {
  return (
    <PageShell maxWidth="max-w-md">
      <PageHero
        title="Verifica tu inscripción"
        description="Ingresá el número de carnet del participante para saber si su postulación está registrada."
      />

      <div className="mt-10! overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card) shadow-xl shadow-black/5">
        <div className="h-1.5! w-full shrink-0" style={{ background: 'linear-gradient(to right, #e30613, #fcee21, #00873e)' }} />
        <div className="p-6! sm:p-8!">
          <FormularioVerificacion />
        </div>
      </div>
    </PageShell>
  );
}
