'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import {
  Home,
  LayoutGrid,
  Mic,
  Users,
  FileText,
  Armchair,
  Glasses,
  Vote,
  LogIn,
} from 'lucide-react';

const links = [
  { label: 'Inicio', href: ROUTES.home, icon: Home },
  { label: 'Categorías', href: ROUTES.categorias, icon: LayoutGrid },
  { label: 'Participantes', href: ROUTES.participante, icon: Mic },
  { label: 'Inscripciones', href: ROUTES.inscripciones, icon: FileText },
  { label: 'Butacas', href: ROUTES.butacas, icon: Armchair },
  { label: 'Realidad Virtual', href: ROUTES.realidadVirtual, icon: Glasses },
  { label: 'Votaciones', href: ROUTES.votaciones, icon: Vote },
  { label: 'Jurado', href: ROUTES.calificacionJurado, icon: Users },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50">
      {/* Desktop — la cinta tricolor inferior (bandera) enmarca la página, como el
          detalle de guitarra del logo, en vez del telón dorado-carmesí de antes. */}
      <nav className="relative hidden h-[88px] items-center gap-4 border-b border-(--border) bg-white px-6! shadow-[0_1px_2px_rgba(27,42,74,0.05)] lg:flex">
        <Link href={ROUTES.home} className="flex shrink-0 items-center">
          <Image
            src="/images/logo_aquicanta.png"
            alt="Aquí Canta Bolivia"
            width={1204}
            height={880}
            priority
            className="h-14 w-auto"
          />
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto">
          {links.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap rounded-lg border px-3! py-2! text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'border-[#1e63b8]/25 bg-[#1e63b8]/10 text-[#164a8c]'
                    : 'border-transparent text-(--text-secondary) hover:bg-[#1e63b8]/5 hover:text-(--text-primary)'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <Link
          href={ROUTES.login}
          className="inline-flex shrink-0 items-center rounded-lg bg-[#1e63b8] px-5! py-2.5! text-sm font-semibold text-white shadow-md shadow-[#1e63b8]/30 transition-all duration-300 hover:bg-[#164a8c]"
        >
          Login
        </Link>

        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-[linear-gradient(90deg,#d52b1e_0%,#e08f1f_42%,#2e7d46_100%)]" />
      </nav>

      {/* Mobile bar — abajo en vez de a la izquierda, para no comerse ancho
          de pantalla en celulares (antes era una barra vertical de 84px).
          TODO: con calma, decidir qué hacer con 8 links + login en una barra
          angosta — por ahora se resuelve con scroll horizontal. */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[64px] w-full items-center gap-1.5 overflow-x-auto border-t border-(--border) bg-white px-2! shadow-[0_-1px_2px_rgba(27,42,74,0.05)] lg:hidden">
        {links.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
                active
                  ? 'border-[#1e63b8]/25 bg-[#1e63b8]/10 text-[#164a8c]'
                  : 'border-transparent bg-[#1b2a4a]/[0.03] text-(--text-secondary) active:bg-[#1e63b8]/10 active:text-[#164a8c]'
              }`}
            >
              <Icon size={17} />
            </Link>
          );
        })}

        <div className="mx-1.5! h-8 w-px shrink-0 bg-(--border)" />

        <Link
          href={ROUTES.login}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1e63b8] text-white shadow-md shadow-[#1e63b8]/30"
        >
          <LogIn size={17} />
        </Link>

        <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#d52b1e_0%,#e08f1f_42%,#2e7d46_100%)]" />
      </nav>
    </header>
  );
}
