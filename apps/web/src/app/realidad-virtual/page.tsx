import type { SVGProps } from "react";
import Image from "next/image";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EscenaPinturaARCliente } from "@/components/features/realidad-aumentada/EscenaPinturaARCliente";
import { VistaCerrada } from "@/components/VistaCerrada";
import { getVistaActiva } from "@/lib/vistas";

export default async function RealidadVirtualPage() {
  const activa = await getVistaActiva("realidad-virtual");
  if (!activa) {
    return (
      <VistaCerrada
        nombre="Realidad Virtual"
        descripcion="La experiencia de realidad aumentada no está disponible por el momento."
      />
    );
  }

  const gradientBorderStyle = {
    borderBottom: "4px solid",
    borderImage: "linear-gradient(to right, #e30613, #fcee21, #00873e) 1",
  };

  const PASOS = [
    "Abre este sitio web en tu celular",
    "Busca un cuadro o pintura cercano en el Teatro Internacional",
    "Apunta la cámara al cuadro por unos segundos",
    "¡Disfruta de esta nueva forma de vivir nuestra cultura!",
  ];

  function CameraIcon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="190 128 180 260" fill="currentColor" {...props}>
        <path d="M351.5,284.64c-1.48,3.15-3.62,5.42-7.37,5.5a7.62,7.62,0,0,1-8.07-7.83c0-16.24,0-32.48,0-48.72,0-6.87-2.88-12.07-9.27-15a16.73,16.73,0,0,0-6.91-1.3c-3.7-.06-7.4,0-11.1,0A22.94,22.94,0,0,1,287.85,203c-1-2.43-1.74-4.94-2.61-7.41-1.42-4-3.77-5.91-8-5.92q-23.83-.09-47.66,0a7.72,7.72,0,0,0-7.85,5.57c-1,2.71-1.82,5.48-3,8.08-4.08,8.79-11,13.54-20.71,13.91-3.69.15-7.4,0-11.1,0-9.51.11-16,6.56-16,16.1-.06,9.85,0,19.69,0,29.54q0,28.29,0,56.58c0,5,1.54,9.41,5.47,12.77,3.3,2.82,7.2,3.67,11.39,3.67h131.7c9.4,0,15.38-5.33,16.51-14.62.6-4.89,2.65-7.61,6.25-8.3,4-.76,7,1,9.28,5.4v6.91c-.18.68-.39,1.35-.53,2-2.88,13.84-15.82,24.31-30.45,24.25-45-.16-90,0-134.94-.07a30.54,30.54,0,0,1-30.25-30.33q-.06-44.6,0-89.18a30.58,30.58,0,0,1,30.22-30.37c3.64,0,7.27,0,10.91,0,4.46,0,6.84-1.73,8.41-5.88.87-2.33,1.66-4.7,2.56-7A22.9,22.9,0,0,1,228.59,174q24.89,0,49.77,0a22.68,22.68,0,0,1,20.91,14.2c1,2.48,1.76,5.07,2.68,7.59,1.47,4,3.92,5.77,8.24,5.82,3.77,0,7.53,0,11.3,0,9.36.14,17,4,23.06,11,3.77,4.39,5.79,9.57,6.95,15.16Z" />
        <path d="M301.85,272.89c.27,26.07-21.68,48.13-48.19,48-26.2-.11-48-22-47.87-48.41s22.15-48.08,48.36-47.92S302.26,246.63,301.85,272.89ZM253.8,305.22c17.95-.34,32.27-14.05,32.38-32.32a32.33,32.33,0,1,0-64.65-.31C221.43,290.68,235.56,304.79,253.8,305.22Z" />
      </svg>
    );
  }

  function PhoneIcon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="190 128 180 260" fill="currentColor" {...props}>
        <path d="M289.8,130c8.1,2.6,14.36,7.38,18.06,15.21a30.67,30.67,0,0,1,2.73,13.35q0,82.62,0,165.24c0,9.75,0,19.51,0,29.26-.05,14.47-9.37,25.61-23.54,28.14a28.6,28.6,0,0,1-4.9.27c-29.51,0-59-.22-88.52.11a28.46,28.46,0,0,1-28.5-28.44q.34-96.87,0-193.76c-.07-14.83,8.61-25.92,21-29.38Zm5.25,125.37q0-31.47,0-62.93c0-3.31,0-3.32-3.18-3.32H184c-3.24,0-3.25,0-3.25,3.29q0,63-.05,126.09c0,2.41.57,3.26,3.14,3.25q54.08-.12,108.14,0c2.53,0,3.17-.76,3.16-3.21C295,297.48,295.05,276.42,295.05,255.37ZM237.91,173.6h54.34c1.37,0,2.86.3,2.82-1.95-.08-5,.13-10-.08-15a12,12,0,0,0-12.32-11.78q-44.87-.06-89.73,0c-7.13,0-12.14,5.13-12.21,12.3,0,4.43.11,8.86-.07,13.28-.1,2.45.63,3.22,3.16,3.21C201.85,173.56,219.88,173.6,237.91,173.6Zm0,163.62c-18.11,0-36.22,0-54.33-.05-2.3,0-3,.72-2.92,2.95.15,4.33,0,8.68.05,13,0,7.81,4.95,12.82,12.7,12.82q44.39,0,88.75,0c7.67,0,12.79-5.12,12.87-12.77,0-4.34-.12-8.69.07-13,.1-2.45-.8-3-3.1-3C274,337.25,256,337.22,237.92,337.22Z" />
        <path d="M237.67,359.17c-3.35,0-6.71.13-10,0-4-.19-6.81-2.4-7.73-5.71a7.69,7.69,0,0,1,3.05-8.43,8.81,8.81,0,0,1,5.34-1.53c6.29-.05,12.59-.1,18.89,0,5.33.1,8.72,3.11,8.84,7.57a7.69,7.69,0,0,1-6.34,7.87,7.22,7.22,0,0,1-1.2.22h-10.8Z" />
      </svg>
    );
  }

  return (
      <main className="overflow-x-hidden bg-(--brand-crema)">
        {/* Versión Mobile: mismo contenido, con fondos/tipografía/colores de la versión de escritorio */}
        <section
          className="relative overflow-hidden bg-(--brand-crema) px-6 py-16 md:hidden"
          style={gradientBorderStyle}
        >
          {/* Anillos decorativos, a juego con la sección equivalente de escritorio */}
          <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 -translate-y-1/4 translate-x-[35%]">
            <span className="absolute inset-[35px] rounded-[50%] border-[3px] border-(--brand-cafe)/30" />
            <span className="absolute inset-[55px] rounded-[50%] border-[4px] border-(--brand-cafe)/30" />
            <span className="absolute inset-[75px] rounded-[50%] border-[5px] border-(--brand-cafe)/30" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <span className="badge badge-gold">Realidad Aumentada</span>

            <h1 className="mt-4 leading-[0.9] tracking-tight">
              <span className="font-bakbak block text-4xl! text-(--brand-negro) uppercase sm:text-5xl!">
                La pintura
              </span>
              <span className="font-gasoek block text-4xl! text-(--brand-cafe) uppercase sm:text-5xl!">
                cobra vida
              </span>
            </h1>

            <p className="font-barlow mt-4 max-w-2xl text-lg! font-medium leading-relaxed text-(--brand-cafe)">
              Apunta tu cámara a la pintura del festival para verla saludarte
              con voz propia.
            </p>

            <div className="mt-10">
              <EscenaPinturaARCliente />
            </div>
          </div>
        </section>

        {/* Versión Desktop: maquetación dedicada de la página Realidad Virtual */}
        <div className="hidden md:block">
          {/* ── 1. Los cuadros cobran vida ─────────────────────────────────── */}
          <section className="relative py-20" style={gradientBorderStyle}>
            {/* Anillos decorativos, sangrados por el borde izquierdo */}
            <div className="pointer-events-none absolute top-1/2 left-0 h-[1200px] w-[900px] -translate-x-[65%] -translate-y-1/2">
              <span className="absolute inset-[105px] rounded-[50%] border-[4px] border-(--brand-cafe)/30" />
              <span className="absolute inset-[140px] rounded-[50%] border-[6px] border-(--brand-cafe)/30" />
              <span className="absolute inset-[175px] rounded-[50%] border-[8px] border-(--brand-cafe)/30" />
              <span className="absolute inset-[210px] rounded-[50%] border-[10px] border-(--brand-cafe)/30" />
              <span className="absolute inset-[245px] rounded-[50%] border-[12px] border-(--brand-cafe)/30" />
              <span className="absolute inset-[280px] rounded-[50%] border-[14px] border-(--brand-cafe)/30" />
            </div>

            <div className="relative mx-auto grid max-w-6xl grid-cols-2 items-center px-8 lg:px-12">
              <div className="flex flex-col justify-self-end">
                <h2 className="font-bakbak text-6xl! leading-[0.88] tracking-tight text-(--brand-negro) lg:text-7xl!">
                  LOS
                </h2>
                <h2 className="font-gasoek text-6xl! leading-[0.88] tracking-tight text-(--brand-cafe) lg:text-7xl!">
                  CUADROS
                </h2>
                <h2 className="font-bakbak text-6xl! leading-[0.88] tracking-tight text-(--brand-negro) lg:text-7xl!">
                  COBRAN
                </h2>
                <h2 className="font-gasoek text-7xl! leading-[0.88] tracking-tight text-(--brand-cafe) lg:text-9xl!">
                  VIDA
                </h2>
                <p className="font-barlow mt-6 max-w-md text-lg! font-medium leading-relaxed text-(--brand-cafe) lg:text-2xl!">
                  En esta edición el atractivo no solo será musical sino también
                  cultural e inmersivo, descubre la historia de cada cuadro con
                  tu dispositivo móvil.
                </p>
              </div>

              {/* z-index elevado + margen negativo: el celular queda por encima
                de la franja de fondo de la sección siguiente. */}
              <div className="relative z-20 mr-auto -mb-32 aspect-[563/1000] w-full max-w-[320px] lg:-mb-70 lg:max-w-lg">
                <Image
                  src="/images/FONDOS/FC-08.png"
                  alt="Escanea el mural de Oruro con tu celular para verlo cobrar vida"
                  fill
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </section>

          {/* ── 2. Franja divisoria ──────────────────────────────────────────── */}
          <section
            className="relative h-48 overflow-hidden lg:h-64"
            style={gradientBorderStyle}
          >
            <Image
              src="/images/FONDOS/FRAV-10.jpg"
              alt=""
              fill
              className="object-cover object-center"
            />
          </section>

          {/* ── 3. Demo + Pasos ──────────────────────────────────────────────── */}
          <section className="relative py-5" style={gradientBorderStyle}>
            <div className="mx-auto max-w-6xl px-8 lg:px-12">
              <div className="grid grid-cols-2 items-center ">
                <div className="relative mx-auto aspect-[563/1000] w-full max-w-sm overflow-hidden rounded-3xl">
                  <Image
                    src="/images/FONDOS/FRV-13.png"
                    alt="Demo de realidad aumentada"
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center text-(--brand-negro)">
                    <CameraIcon className="h-7 w-7 shrink-0" />
                    <span className="font-barlow text-xl font-normal tracking-wide uppercase lg:text-2xl!">
                      Teatro Internacional Oruro
                    </span>
                  </div>

                  <h2 className="font-barlow mt-3 text-6xl! leading-[1.05] font-light text-(--brand-negro) uppercase lg:text-6xl!">
                    Una nueva
                    <br />
                    experiencia
                  </h2>
                  <h2 className="font-bakbak text-6xl! leading-[1.05] font-black text-(--brand-negro) uppercase lg:text-7xl!">
                    En realidad
                    <br />
                    aumentada
                  </h2>

                  <div className="font-barlow mt-6 space-y-4 text-base! leading-relaxed text-(--brand-cafe)">
                    <p>
                      Vive una experiencia diferente en el Teatro Internacional
                      a través de una dinámica de realidad aumentada. Los
                      visitantes podrán recorrer el espacio y descubrir
                      diferentes cuadros instalados especialmente para la
                      actividad.
                    </p>
                    <p>
                      Solo necesitarán escanear los cuadros con la cámara de su
                      celular para activar contenidos digitales, animaciones y
                      experiencias interactivas que harán que las obras cobren
                      vida frente a sus ojos.
                    </p>
                    <p>
                      Una propuesta que combina arte, tecnología e interacción,
                      invitando al público a explorar, descubrir y compartir la
                      experiencia.
                    </p>
                    <p className="font-semibold text-(--brand-negro)">
                      ¡Escanea, descubre y vive el arte de una manera diferente!
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 ml-25">
                <div className="flex items-center text-(--brand-negro)">
                  <PhoneIcon className="h-11 w-11 shrink-0" />
                  <h3 className="font-bakbak text-2xl! font-black uppercase lg:text-3xl!">
                    Pasos en tu dispositivo móvil
                  </h3>
                </div>

                <div className="flex items-center justify-between ml-10 gap-5">
                  <ol className="w-1/2 space-y-8 mt-5">
                    {PASOS.map((paso, i) => (
                      <li key={paso} className="flex items-center gap-4">
                        <span className="font-bakbak flex h-17 w-17 shrink-0 items-center justify-center rounded-full bg-(--brand-cafe) text-3xl! text-white">
                          {i + 1}
                        </span>
                        <span className="font-barlow text-xl! font-normal text-(--brand-negro) uppercase">
                          {paso}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <div className="w-1/2 flex justify-start">
                    <div className="relative aspect-[720/974] w-full max-w-[300px]">
                      <Image
                        src="/images/FONDOS/FC-09.png"
                        alt="Aquí Canta Bolivia"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 4. Cuenta regresiva ──────────────────────────────────────────── */}
          <section
            className="relative flex h-96 items-center overflow-hidden"
            style={gradientBorderStyle}
          >
            <Image
              src="/images/FONDOS/FRAV-11.jpg"
              alt=""
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/50" />

            <div className="relative mx-auto flex w-full justify-center">
              <CountdownTimer />
            </div>
          </section>
        </div>
      </main>
  );
}
