'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface CodigoQRProps {
  codigo: string;
}

// Genera el QR en el navegador (sin depender de nada en la API) a partir del
// `codigo` — el mismo texto que espera POST /sellos/escanear al leerlo.
export function CodigoQR({ codigo }: CodigoQRProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    QRCode.toDataURL(codigo, { width: 300, margin: 1 }).then((url) => {
      if (!cancelado) setDataUrl(url);
    });
    return () => {
      cancelado = true;
    };
  }, [codigo]);

  if (!dataUrl) {
    return <div className="h-16 w-16 shrink-0 rounded-lg bg-(--bg-card-hover)" />;
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      {/* eslint-disable-next-line @next/next/no-img-element -- data URL generado en el cliente, next/image no aplica */}
      <img src={dataUrl} alt={`QR de ${codigo}`} className="h-16 w-16 rounded-lg border border-(--border)" />
      <a
        href={dataUrl}
        download={`sello-${codigo}.png`}
        className="text-xs font-semibold text-(--brand-rojo) hover:underline"
      >
        Descargar
      </a>
    </div>
  );
}
