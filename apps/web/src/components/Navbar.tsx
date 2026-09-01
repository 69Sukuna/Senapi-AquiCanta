'use client';

import { useState } from 'react';
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
  CheckSquare,
  Radio,
  LogIn,
} from 'lucide-react';

const links = [
  { label: 'Inicio', href: ROUTES.home, icon: Home },
  { label: 'Categorías', href: ROUTES.categorias, icon: LayoutGrid },
  { label: 'Cantantes', href: ROUTES.cantante, icon: Mic },
  { label: 'Grupos', href: ROUTES.grupo, icon: Users },
  { label: 'Inscripciones', href: ROUTES.inscripciones, icon: FileText },
  { label: 'Butacas', href: ROUTES.butacas, icon: Armchair },
  { label: 'Realidad Virtual', href: ROUTES.realidadVirtual, icon: Glasses },
  { label: 'Votación Previa', href: ROUTES.votacionPrevia, icon: CheckSquare },
  { label: 'Jurado', href: ROUTES.calificacionJurado, icon: Users },
  { label: 'Votación en Vivo', href: ROUTES.votacionVivo, icon: Radio },
];

export function Navbar() {
  const pathname = usePathname();
  const [openFlyout, setOpenFlyout] = useState<number | null>(null);

  return (
    <header className="sticky top-0 z-50">
      {/* Desktop — la línea dorado-carmesí inferior hace de "telón" que enmarca la página */}
      <nav className="relative hidden h-[88px] items-center gap-4 bg-[linear-gradient(180deg,rgba(23,4,6,0.97)_0%,rgba(40,10,15,0.92)_100%)] px-6! lg:flex">
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
                    ? 'border-[#e0a527]/40 bg-[#e0a527]/15 text-[#f4c94f] shadow-[0_0_16px_-4px_rgba(224,165,39,0.7)]'
                    : 'border-transparent text-[#fdf6ec]/60 hover:bg-white/[0.06] hover:text-[#fdf6ec]'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <Link
          href={ROUTES.login}
          className="inline-flex shrink-0 items-center rounded-lg bg-linear-to-br from-[#f4c94f] to-[#e11d2e] px-5! py-2.5! text-sm font-semibold text-[#200308] shadow-md shadow-black/25 transition-all duration-300 hover:brightness-110"
        >
          Login
        </Link>

        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-linear-to-r from-[#f4c94f] via-[#e11d2e] to-[#f4c94f] opacity-70" />
      </nav>

      {/* Mobile rail — misma línea dorado-carmesí, ahora en el borde derecho */}
      <nav className="fixed bottom-0 left-0 top-0 z-50 flex w-[84px] flex-col items-center overflow-y-auto bg-[linear-gradient(180deg,rgba(23,4,6,0.97)_0%,rgba(40,10,15,0.92)_100%)] py-5! lg:hidden">
        <Link
          href={ROUTES.home}
          className="mb-5! flex h-10 w-16 shrink-0 items-center justify-center"
        >
          <Image
            src="/images/logo_aquicanta.png"
            alt="Aquí Canta Bolivia"
            width={1204}
            height={880}
            priority
            className="h-full w-full object-contain"
          />
        </Link>

        <div className="flex flex-col gap-2.5">
          {links.map(({ label, href, icon: Icon }, i) => {
            const active = pathname === href;
            const open = openFlyout === i;
            return (
              <div key={href} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenFlyout(open ? null : i)}
                  aria-label={label}
                  className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border transition-all duration-200 ${
                    active
                      ? 'border-[#e0a527]/40 bg-[#e0a527]/15 text-[#f4c94f] shadow-[0_0_16px_-4px_rgba(224,165,39,0.7)]'
                      : open
                        ? 'border-[#fdf6ec]/20 bg-[#fdf6ec]/[0.09] text-[#fdf6ec]'
                        : 'border-transparent bg-[#fdf6ec]/[0.04] text-[#fdf6ec]/60'
                  }`}
                >
                  <Icon size={20} />
                </button>

                {open && (
                  <div className="absolute left-[54px] top-1/2 z-10 flex -translate-y-1/2 items-center">
                    <span className="-mr-1! h-2 w-2 rotate-45 border-b border-l border-[#e0a527]/40 bg-[#280a0f]" />
                    <Link
                      href={href}
                      onClick={() => setOpenFlyout(null)}
                      className="whitespace-nowrap rounded-lg border border-[#e0a527]/40 bg-[#280a0f] px-4! py-2.5! text-sm font-semibold text-[#fdf6ec] shadow-lg shadow-black/40"
                    >
                      {label}
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="my-4! h-px w-8 bg-[#e0a527]/18" />

        <Link
          href={ROUTES.login}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-[#f4c94f] to-[#e11d2e] text-[#200308] shadow-md shadow-black/25"
        >
          <LogIn size={19} />
        </Link>

        <span className="pointer-events-none absolute inset-y-0 right-0 w-[2px] bg-linear-to-b from-[#f4c94f] via-[#e11d2e] to-[#f4c94f] opacity-70" />
      </nav>

      {openFlyout !== null && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setOpenFlyout(null)}
          className="fixed inset-0 z-40 cursor-default lg:hidden"
        />
      )}
    </header>
  );
}
