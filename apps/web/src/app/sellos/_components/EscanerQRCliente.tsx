'use client';

import dynamic from 'next/dynamic';

// `ssr: false` en next/dynamic solo se puede invocar desde un Client Component;
// este wrapper existe únicamente para evitar que `html5-qrcode` (usa `window`/
// `navigator.mediaDevices`) se evalúe en el render de servidor. Mismo patrón
// que EscenaPinturaARCliente.tsx para la experiencia de realidad aumentada.
export const EscanerQRCliente = dynamic(() => import('./EscanerQR').then((m) => m.EscanerQR), { ssr: false });
