'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';

// Generado con el compilador oficial de MindAR a partir de la foto de la pintura:
// https://hiukim.github.io/mind-ar-js-doc/tools/compile — colocar el resultado en
// apps/web/public/ar/targets.mind (índice 0 = la pintura).
const TARGET_MIND_URL = '/ar/targets.mind';

// Clip del personaje "cobrando vida" con audio embebido (saludo ya sincronizado).
// Debe exportarse con canal alfa (WebM VP9) para que el fondo no tape la pintura real,
// y con el mismo encuadre/proporción que la foto usada para compilar el target.
const VIDEO_PERSONAJE_URL = '/ar/personaje-saludo.webm';

// Ancho / alto de la imagen objetivo compilada. MindAR mapea el target a un plano de
// 1 unidad de ancho, así que esto define la altura del plano del video para que calce
// exactamente sobre la pintura. Ajustar si la foto real tiene otra proporción.
const TARGET_ASPECT_RATIO = 484 / 388;

type EstadoAR = 'inactivo' | 'cargando' | 'activo' | 'error';

export function EscenaPinturaAR() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mindarRef = useRef<MindARThree | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [estado, setEstado] = useState<EstadoAR>('inactivo');
  const [pinturaDetectada, setPinturaDetectada] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorVideo, setErrorVideo] = useState<string | null>(null);

  // Corta cámara y loop de render si el usuario navega fuera de la página con la
  // experiencia activa — evita dejar la cámara encendida en segundo plano.
  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
      mindarRef.current?.renderer.setAnimationLoop(null);
      mindarRef.current?.stop();
      videoRef.current?.pause();
    };
  }, []);

  const iniciarExperiencia = async () => {
    if (!containerRef.current) return;
    setEstado('cargando');
    setError(null);
    setErrorVideo(null);

    // Red de seguridad: `MindARThree.stop()` no remueve el canvas/video que agrega
    // al contenedor, así que si quedó algo de un intento anterior (detenido o fallido),
    // lo limpiamos antes de crear una instancia nueva.
    containerRef.current.replaceChildren();

    try {
      const mindarThree = new MindARThree({
        container: containerRef.current,
        imageTargetSrc: TARGET_MIND_URL,
        // MindAR inyecta su propia UI de "escaneo" directo en document.body (fuera de
        // nuestro contenedor) y nunca la limpia en stop(), lo que apilaba una capa por
        // cada inicio/detención. La desactivamos porque ya mostramos nuestro propio
        // estado ("Activando cámara…" / "Apunta la cámara hacia la pintura…") con React.
        uiLoading: 'no',
        uiScanning: 'no',
        uiError: 'no',
      });
      mindarRef.current = mindarThree;
      const { renderer, scene, camera } = mindarThree;

      // three.js limpia el canvas a negro OPACO en cada frame por defecto, aunque el
      // contexto WebGL se creó con alpha:true — eso tapaba la cámara entera detrás del
      // canvas. Con clearAlpha en 0, solo se ve lo que dibujamos (el plano del
      // personaje); el resto del canvas queda transparente y deja ver la cámara real.
      renderer.setClearColor(0x000000, 0);

      const video = document.createElement('video');
      video.src = VIDEO_PERSONAJE_URL;
      video.loop = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';
      // Captura fallos de carga/decodificación (ej. formato no soportado en Safari/iOS,
      // que no reproduce WebM) que un .catch() de play() no siempre alcanza a reportar.
      video.addEventListener('error', () => {
        const codigo = video.error?.code;
        const mensajes: Record<number, string> = {
          1: 'la carga se abortó',
          2: 'error de red',
          3: 'no se pudo decodificar el archivo',
          4: 'formato no soportado por este navegador (revisa si es Safari/iOS: no reproduce WebM)',
        };
        console.error('[EscenaPinturaAR] error cargando el video', video.error);
        setErrorVideo(`No se pudo cargar el video: ${codigo ? mensajes[codigo] : 'error desconocido'}.`);
      });
      videoRef.current = video;

      const textura = new THREE.VideoTexture(video);
      textura.colorSpace = THREE.SRGBColorSpace;

      const geometria = new THREE.PlaneGeometry(1, 1 / TARGET_ASPECT_RATIO);
      // `transparent: true` deja pasar el canal alfa propio del video (el fondo
      // recortado del personaje); la opacidad del material queda al 100% para no
      // mezclarlo con la cámara real detrás.
      const material = new THREE.MeshBasicMaterial({ map: textura, transparent: true });
      const plano = new THREE.Mesh(geometria, material);

      const anchor = mindarThree.addAnchor(0);
      anchor.group.add(plano);

      anchor.onTargetFound = () => {
        setPinturaDetectada(true);
        video.currentTime = 0;
        video.play().catch((err) => {
          console.error('[EscenaPinturaAR] video.play() falló en targetFound', err);
          setErrorVideo(`No se pudo reproducir el video (${err instanceof Error ? err.name : 'error desconocido'}).`);
        });
      };

      anchor.onTargetLost = () => {
        setPinturaDetectada(false);
        video.pause();
      };

      await mindarThree.start();

      // mind-ar solo vuelve a calcular el tamaño de la cámara en el evento `resize` de
      // la ventana, pero nuestro contenedor puede asentar su tamaño real después de eso
      // (layout dentro de la página en vez de pantalla completa) — sin este observer, el
      // video quedaba con el tamaño equivocado y se veía chico y descentrado.
      const resizeObserver = new ResizeObserver(() => {
        mindarThree.resize();
      });
      resizeObserver.observe(containerRef.current);
      resizeObserverRef.current = resizeObserver;

      // Safari/iOS solo permite audio con play() disparado dentro de un gesto del
      // usuario. Este play()+pause() ocurre dentro del click de "Iniciar experiencia
      // AR" y desbloquea el audio para los play() automáticos que targetFound haga después.
      // En su propio try/catch: si el video del personaje falla (formato no soportado,
      // 404, etc.) no debe tumbar toda la experiencia — la cámara y el tracking ya
      // están funcionando en este punto.
      try {
        await video.play();
        video.pause();
      } catch (videoErr) {
        console.error('[EscenaPinturaAR] no se pudo pre-cargar/desbloquear el video', videoErr);
        setErrorVideo(
          `No se pudo cargar el video del personaje (${videoErr instanceof Error ? videoErr.name : 'error desconocido'}).`,
        );
      }

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });

      setEstado('activo');
    } catch (err) {
      console.error('[EscenaPinturaAR] fallo al iniciar', err);
      setError('No pudimos activar la cámara. Revisa los permisos del navegador e intenta de nuevo.');
      setEstado('error');
    }
  };

  const detenerExperiencia = () => {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;
    try {
      // `MindARThree.stop()` no está pensado para cubrir todos los estados en los que
      // se lo puede llamar (ej. la cámara terminó su stream sola, permisos revocados a
      // mitad de sesión) y puede lanzar una excepción interna sin capturar. Sin este
      // try/catch, esa excepción tumbaba toda la página ("Application error").
      mindarRef.current?.renderer.setAnimationLoop(null);
      mindarRef.current?.stop();
    } catch (err) {
      console.error('[EscenaPinturaAR] fallo al detener mind-ar', err);
    }
    mindarRef.current = null;
    videoRef.current?.pause();
    videoRef.current = null;
    containerRef.current?.replaceChildren();
    setEstado('inactivo');
    setPinturaDetectada(false);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-black">
        {/* mind-ar mete/saca su <video> y <canvas> acá con appendChild/removeChild por
            fuera de React. Este div nunca debe tener hijos renderizados por JSX: si React
            también intenta insertar/quitar algo adentro, su reconciliador choca con las
            mutaciones de mind-ar y tira "NotFoundError: removeChild ... is not a child of
            this node". El overlay (badge, texto) va como hermano, no como hijo. */}
        <div
          ref={containerRef}
          // `isolate` fuerza a que este div forme su propio contexto de apilamiento: el
          // <video> de la cámara que agrega mind-ar trae z-index:-2 fijo, y sin esto ese
          // z-index negativo se escapaba detrás del bg-black en vez de quedar por delante.
          className="escena-ar-viewport absolute inset-0 isolate"
        />

        {/* Marco decorativo tipo visor de cámara — puramente visual, no afecta el
            tracking ni el tamaño real del <video>/<canvas> que inyecta mind-ar. */}
        <div className="pointer-events-none absolute inset-3 z-10 sm:inset-4">
          <span className="absolute top-0 left-0 h-5 w-5 border-t-2 border-l-2 border-white/40" />
          <span className="absolute top-0 right-0 h-5 w-5 border-t-2 border-r-2 border-white/40" />
          <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-white/40" />
          <span className="absolute right-0 bottom-0 h-5 w-5 border-r-2 border-b-2 border-white/40" />
        </div>

        {estado !== 'activo' && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-7 w-7 text-white/80"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.13a1.5 1.5 0 0 0 1.28-.72l.7-1.16A1.5 1.5 0 0 1 10.9 4.4h2.2a1.5 1.5 0 0 1 1.29.72l.7 1.16A1.5 1.5 0 0 0 16.37 7h2.13A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z"
                />
                <circle cx="12" cy="13" r="3.25" />
              </svg>
            </span>

            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                {estado === 'error' ? 'No se pudo activar' : 'Listo para descubrir'}
              </h2>
              <p className="mt-1 text-sm text-white/70">Apunta la cámara a la pintura</p>
            </div>

            <button
              type="button"
              onClick={iniciarExperiencia}
              disabled={estado === 'cargando'}
              className="badge badge-gold pointer-events-auto cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {estado === 'cargando' ? 'Activando cámara…' : 'Iniciar experiencia AR'}
            </button>
          </div>
        )}

        {estado === 'activo' && (
          <span
            className={`badge pointer-events-none absolute top-3 left-3 z-10 ${pinturaDetectada ? 'badge-green' : 'badge-blue'}`}
          >
            {pinturaDetectada ? 'Pintura detectada' : 'Buscando pintura…'}
          </span>
        )}
        {estado === 'activo' && !pinturaDetectada && (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 z-10 text-center text-sm font-semibold text-white/90">
            Apunta la cámara hacia la pintura…
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-3">
        {estado === 'activo' && (
          <button type="button" onClick={detenerExperiencia} className="badge badge-blue cursor-pointer">
            Detener experiencia
          </button>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
        {errorVideo && (
          <p role="alert" className="text-sm text-red-400">
            {errorVideo}
          </p>
        )}
      </div>
    </div>
  );
}
