import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { CountdownTimer } from '@/components/CountdownTimer';

const CONVOCATORIA_URL =
  'https://drive.google.com/file/d/1ggcf9PPSnQ-7jc0mTFxQqr27Q5ExGJSZ/view?usp=drive_link';
const MAPS_EMBED_URL =
  'https://www.google.com/maps?q=Teatro+Internacional+Oruro,+Bolivia&output=embed';
const MAPS_DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=Teatro+Internacional+Oruro,+Bolivia';

const gradientBorderStyle = {
  borderBottom: '4px solid',
  borderImage: 'linear-gradient(to right, #e30613, #fcee21, #00873e) 1'
}

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-(--brand-blanco)">
      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-(--brand-negro) sm:min-h-screen" style={gradientBorderStyle}>
        <Image
          src="/images/FONDOS/PORTADA-LANDING.png"
          alt="Aquí Canta Bolivia"
          fill
          priority
          className="object-cover object-center lg:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/20 sm:bg-gradient-to-r sm:from-black/90 sm:via-black/40 sm:to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 pb-10 sm:px-10 sm:pb-16 lg:px-12 lg:pb-20">
          <p className="font-barlow max-w-xl text-base tracking-[0.2em] text-white/90 uppercase sm:text-sm ">
            XXXIII VERSIÓN DEL FESTIVAL NACIONAL DE LA CANCIÓN BOLIVIANA
          </p>

          <h1 className="font-bakbak mt-3 text-5xl leading-[0.92] text-white sm:text-7xl lg:text-[6.5rem]">
            AQUÍ... CANTA
            <br />
            <span className="bg-gradient-to-r from-[#e30613] via-[#fcee21] to-[#00873e] bg-clip-text text-transparent">
              BOLIVIA
            </span>
          </h1>

          {/* Botones píldora y temporizador alineados */}
          <div className="mt-1! flex flex-col items-start gap-4 sm:mt-10 sm:gap-5">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link
                href={ROUTES.inscripciones}
                className="font-bakbak rounded-full border border-white/70 bg-black/20 px-5! py-0.5! text-sm! text-white! backdrop-blur-xs transition-all hover:bg-white sm:px-6! sm:py-2! sm:text-lg! hover:text-black!"
              >
                Inscríbete
              </Link>
              <Link
                href={ROUTES.votaciones}
                className="font-bakbak rounded-full border border-white/70 bg-black/20 px-5! py-0.5! text-sm! text-white! backdrop-blur-xs transition-all hover:bg-white sm:px-6! sm:py-2! sm:text-lg! hover:text-black!"
              >
                Votaciones
              </Link>
              <a
                href={CONVOCATORIA_URL}
                target="_blank"
                rel="noreferrer"
                className="font-bakbak rounded-full border border-white/70 bg-black/20 px-5! py-0.5! text-sm! text-white! backdrop-blur-xs transition-all hover:bg-white sm:px-6! sm:py-2! sm:text-lg! hover:text-black!"
              >
                Convocatoria
              </a>
            </div>

            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* ── 2. Convocatoria / ¿Tienes talento? ─────────────────────────── */}
      <section className="relative min-h-[72vh] overflow-hidden bg-(--brand-crema) py-16 sm:py-24" style={gradientBorderStyle}>
        <Image
          src="/images/FONDOS/FC_1.jpg"
          alt=""
          fill
          className="object-cover object-center sm:w-full sm:h-auto sm:object-top"
        />

        {/* Versión Mobile: Centrada, exactamente como el mockup */}
        <div className="relative mx-auto max-w-xl px-6 text-center md:hidden">
          <h2 className="font-bakbak uppercase text-(--brand-negro)">
            <span className="block text-5xl! font-black">Convocatoria</span>
            <span className="mt-1! block text-xl! font-semibold">Preselecciones Departamentales Presenciales</span>
          </h2>
          <div className="font-barlow mt-4 space-y-3.5 text-sm font-medium leading-relaxed text-(--brand-cafe)">
            <p>
              ¿Tienes talento y quieres ser parte de uno de los grandes
              encuentros de la música boliviana?
            </p>
            <p>
              Ya está disponible la Convocatoria Oficial del Festival Aquí Canta
              Bolivia 2026. Conoce las categorías, requisitos, fechas y
              condiciones de participación.
            </p>
            <p>
              Descarga la convocatoria, revisa toda la información y prepárate
              para ser parte de esta gran celebración de la música y la identidad
              boliviana.
            </p>
            <p className="font-semibold text-(--brand-negro)">
              ¡Aquí Canta Bolivia 2026 te espera!
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <a
              href={CONVOCATORIA_URL}
              target="_blank"
              rel="noreferrer"
              className="font-bakbak rounded-full border border-(--brand-negro) bg-transparent px-8 py-2 text-sm font-bold text-(--brand-negro)! transition-all duration-200 hover:bg-(--brand-negro) hover:text-white!"
            >
              Descargar
            </a>
          </div>
        </div>

        {/* Versión Desktop: 2 columnas con divisor tenue */}
        <div className="relative mx-auto hidden max-w-6xl items-center gap-12 px-8 md:grid md:grid-cols-[1.25fr_1fr] lg:px-12">
          <div className="border-r-1 border-(--brand-negro)">
            <h2 className="font-bakbak text-4xl! font-normal font-black text-(--brand-negro) lg:text-6xl!">
              ¿Tienes talento?
            </h2>
            <p className="font-barlow mt-2 text-lg! font-semibold text-(--brand-negro) lg:text-5xl!">
              Sé parte de uno de los<br></br> grandes encuentros de la <br></br> música boliviana
            </p>
            <p className="font-barlow mt-3 max-w-lg text-3xl! leading-relaxed text-(--brand-cafe)">
              Ya está disponible la Convocatoria Oficial del
              <br />
              Festival Aquí Canta Bolivia 2026.
              <br />
              Conoce las categorías, requisitos, fechas y
              <br />
              condiciones de participación.
            </p>
          </div>

          <div className="flex flex-col items-center justify-end! pl-10 text-center">
            <h3 className="font-bakbak uppercase text-(--brand-negro)">
              <span className="block text-5xl! font-black lg:text-6xl!">Convocatoria</span>
              <span className="mt-1! block text-xl! font-semibold lg:text-3xl!">
                Preselecciones Departamentales Presenciales
              </span>
            </h3>
            <a
              href={CONVOCATORIA_URL}
              target="_blank"
              rel="noreferrer"
              className="font-bakbak mt-3 rounded-2xl! border border-(--brand-negro) bg-transparent px-8 py-2 text-4xl! font-bold text-(--brand-negro)! transition-all duration-200 hover:bg-(--brand-negro) hover:text-(--brand-crema)!"
            >
              Descargar
            </a>
          </div>
        </div>
      </section>

      {/* ── 3. Banner Butacas (Rojo) ──────────────────────────────────── */}
      <section className="relative h-auto overflow-hidden py-12 sm:h-72 sm:py-16" style={gradientBorderStyle}>
        <Image
          src="/images/FONDOS/FRAV-02.jpg"
          alt=""
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#b3141a]/10" />

        {/* Versión Mobile: Centrada */}
        <div className="relative mx-auto flex flex-col items-center gap-4 px-6 text-center md:hidden">
          <div>
            <span className="font-bakbak block text-lg font-bold tracking-wide text-white uppercase">
              Participa del evento presencial con tu propia
            </span>
            <span className="font-bakbak block text-3xl font-black text-white">
              BUTACA
            </span>
          </div>
          {/*<Link
            href={ROUTES.butacas}
            className="font-bakbak rounded-full border border-white bg-transparent px-8 py-2 text-sm font-bold text-white! transition-all duration-200 hover:bg-white hover:text-[#b3141a]!"
          >
            Reservar
          </Link>*/}
        </div>

        {/* Versión Desktop: Fila horizontal */}
        <div className="relative mx-auto hidden max-w-6xl items-center justify-around px-8 md:flex lg:px-12">
          <div>
            <span className="font-bakbak text-2xl! font-bold tracking-wide text-white uppercase lg:text-4xl!">
              Participa del evento presencial con tu propia<br />
            </span>
            <span className="font-bakbak text-4xl! font-black text-white lg:text-7xl!">
              BUTACA
            </span>
          </div>
          {/*<Link
            href={ROUTES.butacas}
            className="font-bakbak rounded-2xl! border border-white bg-transparent px-[50px]! py-[10px]! text-4xl! font-bold text-(--brand-blanco)! transition-all duration-200 hover:bg-white hover:text-(--brand-negro)!"
          >
            Reservar
          </Link>*/}
        </div>
      </section>

      {/* ── 4. Inscríbete ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[72vh] bg-(--brand-blanco) py-16 sm:py-24" style={gradientBorderStyle}>
        <Image
          src="/images/FONDOS/FC_2.jpg"
          alt=""
          fill
          className="object-cover object-center sm:w-full sm:h-auto sm:object-top"
        />

        {/* Versión Mobile: Centrada */}
        <div className="relative mx-auto max-w-xl px-6 text-center md:hidden">
          <h2 className="font-bakbak text-3xl font-black text-(--brand-negro)">
            Inscríbete
          </h2>
          <div className="font-barlow mt-4 space-y-3.5 text-sm font-medium leading-relaxed text-(--brand-cafe)">
            <p>
              La música boliviana vuelve a ser protagonista. Te invitamos a
              participar del Festival Aquí Canta Bolivia – Edición 2026, un
              espacio para celebrar nuestro talento, identidad y riqueza cultural
              a través de la música.
            </p>
            <p>
              Sé parte de esta gran experiencia y demuestra tu talento ante un
              público que celebra el arte y la cultura de Bolivia.
            </p>
            <p className="font-semibold text-(--brand-negro)">
              ¡Inscríbete, participa y haz que tu voz sea parte de Aquí Canta
              Bolivia 2026!
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href={ROUTES.inscripciones}
              className="font-bakbak rounded-full border border-(--brand-negro) bg-transparent px-8 py-2 text-sm font-bold text-(--brand-negro)! transition-all duration-200 hover:bg-(--brand-negro) hover:text-white!"
            >
              Formulario
            </Link>
          </div>
        </div>

        {/* Versión Desktop: 2 columnas */}
        <div className="relative mx-auto hidden max-w-6xl items-center px-8 md:grid md:grid-cols-2 lg:px-12">

          {/* Columna Izquierda: Centrada vertical y horizontalmente */}
          <div className="flex flex-col items-center justify-center text-center px-12 py-16">
            <h2 className="font-bakbak text-4xl! font-black text-(--brand-negro)! lg:text-7xl!">
              Inscríbete
            </h2>
            <Link
              href={ROUTES.inscripciones}
              className="font-bakbak text-2xl! text-(--brand-negro)! mt-4 inline-block rounded-full border border-(--brand-negro) bg-transparent px-8 py-2 text-sm font-bold transition-all duration-200 hover:bg-(--brand-negro) hover:text-(--brand-blanco)!"
            >
              Formulario
            </Link>
          </div>

          {/* Línea Divisoria Central (Alta y Centrada Exactamente) */}
          <div className="absolute left-1/2 top-1/2 h-[80%] -translate-x-1/2 -translate-y-1/2 w-[1px] bg-(--brand-negro)" />

          {/* Columna Derecha: Misma distancia (px-12) y texto alineado a la izquierda */}
          <div className="flex flex-col justify-center text-left px-12 py-16">
            <h3 className="font-bakbak text-2xl! font-black text-(--brand-negro)! lg:text-5xl!">
              Participa en <br />
              13 categorías <br />
              disponibles
            </h3>
            <p className="font-barlow mt-3 text-3xl! leading-relaxed text-(--brand-cafe)">
              Llena el formulario de inscripción y <br />
              muestra tu talento a Bolivia y al mundo <br />
              en el festival musical más importante <br />
              del año.
            </p>
          </div>

        </div>
      </section>

      {/* ── 5. Banner Realidad Virtual (Amarillo) ──────────────────────── */}
      <section className="relative h-auto overflow-hidden py-12 sm:h-72 sm:py-16" style={gradientBorderStyle}>
        <Image
          src="/images/FONDOS/FRAV_01.jpg"
          alt=""
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#d8a712]/10" />

        {/* Versión Mobile: Centrada */}
        <div className="relative mx-auto flex flex-col items-center gap-4 px-6 text-center md:hidden">
          <div>
            <span className="font-bakbak block text-lg font-bold tracking-wide text-white uppercase">
              Vive una nueva
            </span>
            <span className="font-bakbak block text-3xl font-black text-white">
              EXPERIENCIA
            </span>
          </div>
          <Link
            href={ROUTES.realidadVirtual}
            className="font-bakbak rounded-full border border-white bg-transparent px-8 py-2 text-sm font-bold text-white! transition-all duration-200 hover:bg-white hover:text-(--brand-negro)!"
          >
            Realidad Virtual
          </Link>
        </div>

        {/* Versión Desktop: Fila horizontal */}
        <div className="relative mx-auto hidden max-w-5xl w-full items-center justify-around px-8 md:flex lg:px-12">
          <div>
            <span className="font-bakbak text-2xl! font-bold tracking-wide text-white uppercase lg:text-4xl!">
              VIVE UNA NUEVA
            </span>
            <br />
            <span className="font-bakbak text-4xl! font-black text-white lg:text-7xl!">
              EXPERIENCIA
            </span>
          </div>

          <Link
            href={ROUTES.realidadVirtual}
            className="font-bakbak shrink-0 rounded-2xl! border border-white bg-transparent px-[50px]! py-[10px]! text-4xl! font-bold text-(--brand-blanco)! transition-all duration-200 hover:bg-white hover:text-(--brand-negro)!"
          >
            Realidad Virtual
          </Link>
        </div>
      </section>

      {/* ── 6. Los Cuadros Cobran Vida ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-(--brand-crema)" style={gradientBorderStyle}>
        {/* Fondo de la sección */}
        <Image
          src="/images/FONDOS/FC_3.jpg"
          alt=""
          fill
          className="object-cover object-center"
        />

        {/* Contenedor principal con padding solo vertical para el texto */}
        <div className="relative mx-auto grid min-h-[95vh] max-w-6xl items-center gap-10 px-6 py-12 sm:grid-cols-2 sm:px-10 lg:px-12">

          {/* Columna Texto */}
          <div className="text-center sm:text-left z-10">
            <h2 className="font-bakbak text-5xl! leading-[0.88] tracking-tight text-(--brand-negro) sm:text-6xl! lg:text-7xl!">
              LOS
            </h2>
            <h2 className="font-gasoek text-5xl! leading-[0.88] tracking-tight text-(--brand-cafe) sm:text-6xl! lg:text-7xl!">
              CUADROS
            </h2>
            <h2 className="font-bakbak text-5xl! leading-[0.88] tracking-tight text-(--brand-negro) sm:text-6xl! lg:text-7xl!">
              COBRAN
            </h2>
            <h2 className="font-gasoek text-5xl! leading-[0.88] tracking-tight text-(--brand-cafe) sm:text-6xl! lg:text-9xl!">
              VIDA
            </h2>
            <p className="font-barlow mt-6 max-w-md text-base! font-medium leading-relaxed text-(--brand-cafe) sm:text-2xl!">
              En esta edición el atractivo no solo será musical
              <br />
              sino también cultural e inmersivo, descubre la
              <br />
              historia de cada cuadro con tu dispositivo móvil.
            </p>
          </div>

          {/* Columna Imagen Celular: Pegada arriba y abajo */}
          <div className="relative h-full w-full min-h-[450px] sm:absolute sm:right-6 sm:top-0 sm:bottom-0 sm:h-full sm:w-[45%] lg:right-12">
            <Image
              src="/images/FONDOS/CELULAR-VR-07.png"
              alt="Experiencia de Realidad Aumentada — Aleación Andina"
              fill
              className="object-cover object-center sm:object-contain sm:object-center drop-shadow-2xl"
            />
          </div>

        </div>
      </section>

      {/* ── 7. ¿Cómo llegar? (Teatro Internacional Oruro) ───────────── */}
      <section className="relative overflow-hidden bg-(--brand-blanco)" style={gradientBorderStyle}>
        <Image
          src="/images/FONDOS/FC_4.jpg"
          alt=""
          fill
          className="object-cover object-center"
        />

        <div className="relative mx-auto max-w-7xl">
          {/* Bloque Superior: Foto con corte diagonal + Texto centrado */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">

            {/* Foto del Teatro con recorte diagonal */}
            <div className="relative h-72 sm:h-96 md:h-[420px] w-full overflow-hidden md:[clip-path:polygon(0_0,100%_0,82%_100%,0_100%)]">
              <Image
                src="/images/palco.jpg"
                alt="Teatro Internacional Oruro"
                fill
                className="object-cover object-center"
              />
            </div>

            {/* Texto y Botón alineados al centro */}
            <div className="flex flex-col items-start justify-start p-8 text-start md:items-center md:p-12">
              <h2 className="font-bakbak text-5xl! font-black text-(--brand-negro)! lg:text-6xl!">
                ¿Cómo llegar?
              </h2>
              <p className="font-barlow mt-4 max-w-md text-xl! leading-relaxed text-(--brand-cafe) lg:text-xl!">
                Aquí Canta Bolivia tendrá como sede oficial el
                <br />
                Teatro Internacional de la ciudad de Oruro,
                <br />
                aquí te explicamos cómo puedes llegar allá.
              </p>
              <a
                href={MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="font-bakbak mt-6 inline-block rounded-full border border-(--brand-negro) bg-transparent px-8 py-2 text-base font-bold text-(--brand-negro)! transition-all duration-200 hover:bg-(--brand-negro) hover:text-(--brand-blanco)!"
              >
                Google Maps
              </a>
            </div>

          </div>

          {/* Mapa embebido de Google Maps en la parte inferior */}
          <div className="relative h-80 w-full overflow-hidden border-t border-neutral-200 sm:h-[400px]">
            <iframe
              src={MAPS_EMBED_URL}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación del Teatro Internacional Oruro"
            />
          </div>
        </div>
      </section>

      {/* ── 8. Estadísticas (Verde) ────────────────────────────────────── */}
      <section className="relative flex items-center overflow-hidden py-14 sm:py-18 h-72" style={gradientBorderStyle}>
        <Image
          src="/images/FONDOS/FRAV-03.jpg"
          alt=""
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#006837]/10" />

        <div className="relative mx-auto flex max-w-4xl items-center justify-center gap-3 px-6 text-center text-white sm:gap-10 sm:px-10 md:gap-16">
          <div className="flex flex-col items-center">
            <span className="font-bakbak text-5xl leading-none sm:text-7xl lg:text-8xl">
              13 CATEGORÍAS
            </span>
          </div>

        </div>
      </section>
    </main >
  );
}
