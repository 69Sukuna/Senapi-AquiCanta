import type { SVGProps } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.75h2.6l.4-3.02h-3v-1.93c0-.87.24-1.47 1.5-1.47h1.6V4.14C15.9 4.06 15 4 13.94 4c-2.24 0-3.78 1.37-3.78 3.88v2.17H7.55v3.02h2.61V21h3.34z" />
    </svg>
  );
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.001 2C6.478 2 2 6.477 2 12c0 2.11.657 4.075 1.775 5.685L2.5 22l4.44-1.245A9.945 9.945 0 0 0 12.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2zm0 18.06a8.02 8.02 0 0 1-4.09-1.121l-.294-.174-2.634.738.703-2.567-.192-.264A8.05 8.05 0 0 1 3.94 12c0-4.446 3.617-8.06 8.06-8.06 4.444 0 8.06 3.614 8.06 8.06 0 4.444-3.616 8.06-8.06 8.06z" />
    </svg>
  );
}

// Entidades que auspician el festival — solo el nombre en mayúsculas,
// debajo del logo de la Secretaría (ver AUSPICIA en el JSX).
const AUSPICIAN = [
  { nombre: 'GOBIERNO AUTÓNOMO DEPARTAMENTAL DE ORURO' },
  { nombre: 'GOBIERNO AUTÓNOMO MUNICIPAL DE ORURO' },
  { nombre: 'CONSEJO DEPARTAMENTAL DE CULTURAS ORURO' },
];

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    handle: 'Secretaría Departamental de Cultura y Turismo de Oruro',
    href: 'https://www.facebook.com/SecretariadeCulturaGADOR',
    icon: FacebookIcon,
  },
  {
    label: 'TikTok',
    handle: 'Cultura y Turismo Oruro',
    href: 'https://www.tiktok.com/@cultura_y_turismo_oruro',
    icon: TikTokIcon,
  },
];

const WHATSAPP_NUMBERS = ['59173816398', '59164775274', '59176153717'];

const UBICACION = {
  nombre: 'Teatro Internacional Oruro',
  direccion: 'Urbanización CORDEOR, tras el surtidor QV2',
  mapsHref: 'https://www.google.com/maps/dir/?api=1&destination=Teatro+Internacional+Oruro,+Bolivia',
};

// Chip blanco alrededor del logo: sin esto, un logo con fondo oscuro o
// transparente se pierde contra el negro del footer.
function LogoChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-(--brand-blanco) p-2! shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      {children}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold tracking-[0.22em] text-(--brand-rojo) uppercase">{children}</span>
  );
}

export function Footer() {
  return (
    <footer className="relative bg-(--brand-negro) px-6! pt-12! pb-10! text-sm text-white/70">
      {/* Cinta tricolor: mismo detalle del Navbar, cerrando la página por arriba del footer */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#d52b1e_0%,#e08f1f_42%,#2e7d46_100%)]" />

      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10">
        {/* Auspicia — un solo logo (Secretaría) arriba, y los nombres de
            las entidades debajo, solo en mayúsculas (sin logo por cada una). */}
        <div className="flex flex-col items-center gap-4">
          <LogoChip>
            <Image
              src="/images/secretaria_logo.png"
              alt="Secretaría de Cultura y Turismo — Oruro"
              width={1200}
              height={1200}
              className="h-full w-full rounded-full object-contain"
            />
          </LogoChip>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1.5">
            {AUSPICIAN.map(({ nombre }) => (
              <span key={nombre} className="text-sm font-bold tracking-wide text-white uppercase">
                {nombre}
              </span>
            ))}
          </div>
        </div>

        <div className="h-px w-full max-w-md bg-white/10" />

        {/* Más información: redes + ubicación — a la izquierda en mobile
            (centrado se veía raro con textos largos partidos en 2 líneas),
            centrado en fila desde sm como antes. */}
        <div className="flex w-full flex-col items-start gap-6 sm:w-auto sm:items-center">
          <SectionHeading>Enlaces de Interes</SectionHeading>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-6">
            {SOCIAL_LINKS.map(({ label, handle, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 text-white/80 transition-colors duration-300 hover:text-(--accent-crimson-light)"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">{handle}</span>
              </a>
            ))}

            <a
              href={UBICACION.mapsHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 text-white/80 transition-colors duration-300 hover:text-(--accent-crimson-light)"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="flex flex-col text-left text-sm font-medium">
                <span>{UBICACION.nombre}</span>
                <span className="text-xs font-normal text-white/50">{UBICACION.direccion}</span>
              </span>
            </a>
          </div>
        </div>

        <div className="h-px w-full max-w-md bg-white/10" />

        {/* Informaciones (contacto) */}
        <div className="flex flex-col items-center gap-4">
          <SectionHeading>Informaciones</SectionHeading>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {WHATSAPP_NUMBERS.map((number) => (
              <a
                key={number}
                href={`https://wa.me/${number}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-(--accent-crimson-light)"
              >
                <WhatsAppIcon className="h-4 w-4" />+{number.slice(0, 3)} {number.slice(3)}
              </a>
            ))}
          </div>
        </div>

        <p className="text-center text-white/40">
          © {new Date().getFullYear()} Oruro Es...
        </p>
      </div>
    </footer>
  );
}
