'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { guardarToken } from '@/lib/authVisitante';

// Página mínima a propósito: no carga imágenes ni scripts de terceros antes
// de sacar el token de la URL (para no filtrarlo vía Referer) — apenas lo
// guarda, hace `router.replace` para que ni siquiera quede en el historial.
function ProcesarCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const redirect = searchParams.get('redirect');
    if (token) {
      guardarToken(token);
    }
    const destinoSeguro = redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';
    router.replace(destinoSeguro);
  }, [router, searchParams]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <ProcesarCallback />
    </Suspense>
  );
}
