'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'acb_visitor_id';

// Identidad anónima del visitante mientras no exista login: un UUID que vive
// en localStorage (a diferencia de useVotacionSesion, que usa sessionStorage,
// este debe sobrevivir entre sesiones para que el pasaporte de Sellos no se
// reinicie cada vez que la persona vuelve a abrir la app).
export function useVisitorId(): string | null {
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        setVisitorId(guardado);
        return;
      }

      const nuevo = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, nuevo);
      setVisitorId(nuevo);
    } catch {
      setVisitorId(crypto.randomUUID());
    }
  }, []);

  return visitorId;
}
