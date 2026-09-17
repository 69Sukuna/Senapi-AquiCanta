'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trophy } from 'lucide-react';
import { fetchAdmin } from '@/lib/auth';

interface VisitanteRanking {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  totalSellos: number;
}

interface ReporteEvento {
  eventoId: string;
  eventoNombre: string;
  trayectoNombre: string;
  totalPuntos: number;
  visitantesCompletaron: number;
}

interface ReporteTrayecto {
  trayectoId: string;
  trayectoNombre: string;
  totalEventos: number;
  visitantesCompletaron: number;
}

// Reportes: solo cuentan visitantes REALES logueados con Google — un UUID
// anónimo no se puede mostrar con nombre/email, así que no aparece acá (ver
// `listarVisitantesAdmin`/`reportePorEvento` en el backend). Vive fuera del
// selector de trayecto de arriba, igual que Medallas.
export function ReportesTab() {
  const [visitantes, setVisitantes] = useState<VisitanteRanking[] | null>(null);
  const [trayectos, setTrayectos] = useState<ReporteTrayecto[] | null>(null);
  const [eventos, setEventos] = useState<ReporteEvento[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchAdmin('/sellos/admin/visitantes').then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<VisitanteRanking[]>;
      }),
      fetchAdmin('/sellos/admin/reportes/trayectos').then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<ReporteTrayecto[]>;
      }),
      fetchAdmin('/sellos/admin/reportes/eventos').then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<ReporteEvento[]>;
      }),
    ])
      .then(([v, t, e]) => {
        setVisitantes(v);
        setTrayectos(t);
        setEventos(e);
      })
      .catch(() => setError('No se pudieron cargar los reportes.'));
  }, []);

  if (error) {
    return <div className="mt-6! rounded-2xl border border-dashed border-(--border) p-8! text-center text-(--text-muted)">{error}</div>;
  }

  if (!visitantes || !trayectos || !eventos) {
    return <div className="mt-6! text-center text-(--text-muted)">Cargando...</div>;
  }

  return (
    <div className="mt-6! space-y-8">
      <div>
        <h3 className="font-bold text-(--text-primary)">Ranking de visitantes</h3>
        <p className="text-xs text-(--text-muted)">
          Solo cuentas de Google logueadas — los escaneos anónimos no aparecen porque no hay forma de identificarlos.
        </p>

        {visitantes.length === 0 ? (
          <p className="mt-4! rounded-2xl border border-dashed border-(--border) p-6! text-center text-sm text-(--text-muted)">
            Todavía no se logueó ningún visitante.
          </p>
        ) : (
          <div className="mt-3! overflow-hidden rounded-2xl border border-(--border)">
            {visitantes.map((v, i) => (
              <div
                key={v.id}
                className={`flex items-center gap-3! p-3! ${i > 0 ? 'border-t border-(--border)' : ''} ${
                  i === 0 ? 'bg-(--accent-gold-light)/10' : 'bg-(--bg-card)'
                }`}
              >
                <span className="flex w-6 shrink-0 items-center justify-center text-sm font-bold text-(--text-muted)">
                  {i === 0 ? <Trophy size={16} className="text-(--accent-gold-light)" /> : i + 1}
                </span>
                {v.avatarUrl ? (
                  <Image src={v.avatarUrl} alt={v.name ?? v.email} width={32} height={32} className="h-8 w-8 shrink-0 rounded-full" unoptimized />
                ) : (
                  <span className="h-8 w-8 shrink-0 rounded-full bg-(--border)" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-(--text-primary)">{v.name || 'Sin nombre'}</p>
                  <p className="truncate text-xs text-(--text-muted)">{v.email}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-(--text-primary)">
                  {v.totalSellos} {v.totalSellos === 1 ? 'sello' : 'sellos'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-bold text-(--text-primary)">Informe por trayecto</h3>
        <p className="text-xs text-(--text-muted)">Cuántos visitantes logueados completaron el trayecto ENTERO (todos sus eventos).</p>

        {trayectos.length === 0 ? (
          <p className="mt-4! rounded-2xl border border-dashed border-(--border) p-6! text-center text-sm text-(--text-muted)">
            Todavía no hay ningún trayecto creado.
          </p>
        ) : (
          <div className="mt-3! overflow-hidden rounded-2xl border border-(--border)">
            {trayectos.map((t, i) => (
              <div
                key={t.trayectoId}
                className={`flex items-center justify-between gap-3! p-3! ${i > 0 ? 'border-t border-(--border)' : ''} bg-(--bg-card)`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-(--text-primary)">{t.trayectoNombre}</p>
                  <p className="truncate text-xs text-(--text-muted)">
                    {t.totalEventos} {t.totalEventos === 1 ? 'evento' : 'eventos'}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-(--text-primary)">
                  {t.visitantesCompletaron} {t.visitantesCompletaron === 1 ? 'persona' : 'personas'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-bold text-(--text-primary)">Informe por evento</h3>
        <p className="text-xs text-(--text-muted)">Cuántos visitantes logueados completaron cada evento.</p>

        {eventos.length === 0 ? (
          <p className="mt-4! rounded-2xl border border-dashed border-(--border) p-6! text-center text-sm text-(--text-muted)">
            Todavía no hay ningún evento creado.
          </p>
        ) : (
          <div className="mt-3! overflow-hidden rounded-2xl border border-(--border)">
            {eventos.map((e, i) => (
              <div
                key={e.eventoId}
                className={`flex items-center justify-between gap-3! p-3! ${i > 0 ? 'border-t border-(--border)' : ''} bg-(--bg-card)`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-(--text-primary)">{e.eventoNombre}</p>
                  <p className="truncate text-xs text-(--text-muted)">{e.trayectoNombre}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-(--text-primary)">
                  {e.visitantesCompletaron} {e.visitantesCompletaron === 1 ? 'persona' : 'personas'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
