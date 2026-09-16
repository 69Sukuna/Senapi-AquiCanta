'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import {
  Home,
  LayoutGrid,
  Mic,
  Users,
  FileText,
  Armchair,
  Glasses,
  Vote,
  Stamp,
  User,
} from 'lucide-react';

// Split en dos grupos a propósito, para armar el layout de escritorio con el
// logo centrado entre ambos (ver diseño de referencia) — en mobile se
// vuelven a unir en una sola fila de íconos en la barra inferior.
// .filter(Boolean) para poder "comentar" una pestaña con un `false &&`
// en vez de borrarla — ver lib/featureFlags.ts.
const LINKS_IZQUIERDA = [
  { label: 'Inicio', href: ROUTES.home, icon: Home },
  { label: 'Categorías', href: ROUTES.categorias, icon: LayoutGrid },
  FEATURE_FLAGS.participantes && { label: 'Participantes', href: ROUTES.participante, icon: Mic },
  { label: 'Inscripciones', href: ROUTES.inscripciones, icon: FileText },
].filter(Boolean) as { label: string; href: string; icon: typeof Home }[];

const LINKS_DERECHA = [
  { label: 'Butacas', href: ROUTES.butacas, icon: Armchair },
  { label: 'Realidad Virtual', href: ROUTES.realidadVirtual, icon: Glasses },
  { label: 'Votaciones', href: ROUTES.votaciones, icon: Vote },
  FEATURE_FLAGS.jurado && { label: 'Jurado', href: ROUTES.calificacionJurado, icon: Users },
  { label: 'Sellos', href: ROUTES.sellos, icon: Stamp },
].filter(Boolean) as { label: string; href: string; icon: typeof Home }[];

const TODOS_LOS_LINKS = [...LINKS_IZQUIERDA, ...LINKS_DERECHA];

function NavLink({ label, href, activo }: { label: string; href: string; activo: boolean }) {
  return (
    <Link
      href={href}
      className={`font-barlow rounded-full px-4! py-2! text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
        activo ? 'bg-white/10 text-white!' : 'text-white/70! hover:bg-white/5 hover:text-white!'
      }`}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();

  return (
    // sticky va en <header>, no en cada <nav> — el contenedor de un sticky
    // es su padre inmediato, y <header> sin esto se achica al alto exacto
    // del nav visible (display:none no ocupa espacio), dejándole cero
    // margen para "pegarse": se despegaba apenas se scrolleaba un pixel.
    // body sí es alto (toda la página), así que sticky en header funciona.
    <header className="sticky top-0 z-50">
      {/* Escritorio — logo centrado entre dos grupos de links, como en el
          diseño de referencia. Empieza en md (768px), no en lg (1024px):
          con la barra inferior de antes, una ventana apenas más chica que
          el escritorio ya caía a la vista mobile — acá el texto/gaps se
          achican un poco entre md y lg para que la fila siga entrando. */}
      <nav className="relative hidden h-20 items-center justify-between gap-2 bg-(--brand-negro) px-4! md:flex lg:h-24 lg:px-8!">
        <div className="flex min-w-0 items-center gap-0.5 lg:gap-1">
          {LINKS_IZQUIERDA.map((link) => (
            <NavLink key={link.href} {...link} activo={pathname === link.href} />
          ))}
        </div>

        <Link href={ROUTES.home} className="flex shrink-0 items-center px-2!">
          <Image
            src="/images/LOGOS/LOGO ACB BLANCO.svg"
            alt="Aquí Canta Bolivia"
            width={1920}
            height={1080}
            priority
            className="h-12 w-auto lg:h-16"
          />
        </Link>

        <div className="flex min-w-0 items-center gap-0.5 lg:gap-1">
          {LINKS_DERECHA.map((link) => (
            <NavLink key={link.href} {...link} activo={pathname === link.href} />
          ))}

          <Link
            href={ROUTES.login}
            aria-label="Iniciar sesión"
            title="Iniciar sesión"
            className="ml-2! flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 text-white! transition-colors duration-200 hover:border-white hover:bg-white/10"
          >
            <User size={17} />
          </Link>
        </div>

        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-[linear-gradient(90deg,#d52b1e_0%,#e08f1f_42%,#2e7d46_100%)]" />
      </nav>

      {/* Mobile — franja superior solo de marca (el logo) + barra de
          botones fija abajo con los links, como pide la referencia. */}
      <nav className="relative flex h-14 items-center justify-center bg-(--brand-negro) md:hidden">
        <Link href={ROUTES.home} className="flex items-center">
          <Image
            src="/images/LOGOS/LOGO ACB BLANCO.svg"
            alt="Aquí Canta Bolivia"
            width={1920}
            height={1080}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-[linear-gradient(90deg,#d52b1e_0%,#e08f1f_42%,#2e7d46_100%)]" />
      </nav>

      {/* padding-bottom por style (no clase) para sumar el safe-area del
          home indicator del iPhone ENCIMA del py-3 normal, no en su lugar —
          con box-sizing:border-box, meterlo en la altura fija lo hubiera
          achicado en vez de agregarlo abajo. */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-1 overflow-x-auto bg-(--brand-negro) px-2! pt-3! md:hidden"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        {TODOS_LOS_LINKS.map(({ label, href, icon: Icon }) => {
          const activo = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                activo ? 'bg-white/10 text-white!' : 'text-white/60! active:bg-white/5'
              }`}
            >
              <Icon size={18} />
            </Link>
          );
        })}

        <div className="mx-1! h-8 w-px shrink-0 bg-white/15" />

        <Link
          href={ROUTES.login}
          aria-label="Iniciar sesión"
          title="Iniciar sesión"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 text-white!"
        >
          <User size={17} />
        </Link>

        <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#d52b1e_0%,#e08f1f_42%,#2e7d46_100%)]" />
      </nav>
    </header>
  );
}
