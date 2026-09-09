'use client';

import { useEffect, useState } from 'react';
import type { ClaveVista } from '@/lib/vistas';
import { VistaCerrada } from './VistaCerrada';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface VistaGateProps {
  clave: ClaveVista;
  nombre: string;
  children: React.ReactNode;
}

// Igual que lib/vistas.ts pero para páginas que ya son 'use client' (no
// pueden hacer el fetch en el servidor antes de renderizar) — consulta el
// estado al montar y, mientras tanto, no muestra nada para evitar un
// parpadeo del contenido normal seguido del aviso de "cerrado".
export function VistaGate({ clave, nombre, children }: VistaGateProps) {
  const [estado, setEstado] = useState<'cargando' | 'activo' | 'cerrado'>('cargando');
  const [descripcion, setDescripcion] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    fetch(`${API_URL}/configuraciones-vista/${clave}`)
      .then((res) => (res.ok ? res.json() : { activo: true }))
      .then((data) => {
        if (cancelado) return;
        setDescripcion(data.descripcion ?? null);
        setEstado(data.activo === false ? 'cerrado' : 'activo');
      })
      .catch(() => {
        if (!cancelado) setEstado('activo');
      });

    return () => {
      cancelado = true;
    };
  }, [clave]);

  if (estado === 'cargando') return null;
  if (estado === 'cerrado') return <VistaCerrada nombre={nombre} descripcion={descripcion} />;
  return <>{children}</>;
}
