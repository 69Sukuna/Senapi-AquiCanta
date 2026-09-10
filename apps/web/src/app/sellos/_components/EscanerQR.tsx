'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

interface EscanerQRProps {
  onDetectado: (codigo: string) => void;
  onCerrar: () => void;
}

const ELEMENT_ID = 'sellos-qr-reader';

// Cuando el <video> de una instancia "vieja" del escáner se retira del DOM
// justo mientras su play() interno todavía no resolvía, el navegador rechaza
// esa promesa con este AbortError puntual — ruido esperado del propio
// <video>, no un fallo real (la cámara vieja ya se está deteniendo de todos
// modos). `event.preventDefault()` en 'unhandledrejection' NO sirve acá: solo
// evita que el navegador la loguee por su cuenta, pero el overlay de errores
// de Next.js tiene su propio listener independiente y la muestra igual. La
// única forma de que un rechazo nunca llegue a "sin manejar" es que alguien
// le enganche un `.catch()` a esa promesa en particular — como no podemos
// tocar el `play()` que hace html5-qrcode internamente, se parcha
// `HTMLMediaElement.prototype.play` una sola vez para que todo `<video>` de
// la página quede cubierto.
declare global {
  interface Window {
    __selloPlayPatched__?: boolean;
  }
}
if (typeof window !== 'undefined' && !window.__selloPlayPatched__) {
  window.__selloPlayPatched__ = true;
  const playOriginal = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
    const promesa = playOriginal.call(this);
    promesa.catch((err: unknown) => {
      const esPlayInterrumpido =
        err instanceof DOMException && err.name === 'AbortError' && /interrupted because the media was removed/i.test(err.message);
      if (!esPlayInterrumpido) throw err;
    });
    return promesa;
  };
}

export function EscanerQR({ onDetectado, onCerrar }: EscanerQRProps) {
  const [error, setError] = useState<string | null>(null);
  // Ref para no tener que reiniciar la cámara si el componente padre vuelve
  // a renderizar con una función `onDetectado` nueva.
  const onDetectadoRef = useRef(onDetectado);
  onDetectadoRef.current = onDetectado;

  useEffect(() => {
    // React StrictMode (activo en desarrollo) monta este efecto, lo desmonta
    // y lo vuelve a montar de inmediato para detectar bugs. El `stop()` del
    // primer montaje no cancela el `start()` en curso (permiso + cámara real
    // tardan; con cámara falsa en pruebas es casi instantáneo, por eso no se
    // veía ahí) — sigue inicializándose en segundo plano y termina inyectando
    // su <video> en el contenedor DESPUÉS del segundo montaje, aunque ya se
    // haya "detenido". Por eso no basta con limpiar el contenedor al montar:
    // hay que detener cada instancia también cuando su `start()` resuelve
    // tarde, si para ese momento el efecto ya fue cancelado.
    document.getElementById(ELEMENT_ID)?.replaceChildren();

    const scanner = new Html5Qrcode(ELEMENT_ID);
    let cancelado = false;
    let detenido = false;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (codigoDetectado) => {
          if (detenido) return;
          detenido = true;
          onDetectadoRef.current(codigoDetectado);
        },
        () => {
          // Frame sin código legible — esperado en la mayoría de frames, se ignora.
        },
      )
      .then(() => {
        // Si ya nos cancelaron (remount de StrictMode o cierre real) antes de
        // que la cámara terminara de iniciar, la apagamos recién ahora.
        if (cancelado) {
          scanner
            .stop()
            .then(() => scanner.clear())
            .catch(() => {});
        }
      })
      .catch(() => {
        if (!cancelado) setError('No pudimos acceder a la cámara. Revisa los permisos del navegador.');
      });

    return () => {
      cancelado = true;
      detenido = true;
      // Si `start()` ya resolvió, esto la detiene ya; si sigue en curso, el
      // `.then()` de arriba se encarga apenas termine. Si nunca llegó a
      // iniciar (sin permiso/dispositivo), `stop()` lanza una excepción
      // síncrona en vez de rechazar la promesa.
      try {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
      } catch {
        // nada que detener todavía
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6! bg-black/90 p-6!">
      <div id={ELEMENT_ID} className="w-full max-w-sm overflow-hidden rounded-2xl" />
      <p className="text-center text-sm text-white/70">Apunta la cámara al QR del punto de escaneo.</p>
      {error && <p className="text-center text-sm text-red-300">{error}</p>}
      <button
        onClick={onCerrar}
        className="inline-flex items-center gap-2! rounded-lg bg-white/10 px-5! py-2.5! text-sm font-semibold text-white transition-colors hover:bg-white/20"
      >
        <X size={16} />
        Cancelar
      </button>
    </div>
  );
}
