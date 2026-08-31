'use client';

import dynamic from 'next/dynamic';

// `ssr: false` en next/dynamic solo se puede invocar desde un Client Component;
// este wrapper existe únicamente para que `page.tsx` (Server Component) pueda
// quedarse sin 'use client' y aun así evitar que MindAR/Three.js se evalúen en el
// render de servidor, donde `window` no existe.
export const EscenaPinturaARCliente = dynamic(
  () => import('./EscenaPinturaAR').then((m) => m.EscenaPinturaAR),
  { ssr: false },
);
