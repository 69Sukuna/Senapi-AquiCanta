'use client';

import { useState } from 'react';
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
  Music2
} from 'lucide-react';

const links = [
  { label: 'Inicio', href: ROUTES.home, icon: Home },
  { label: 'Categorías', href: ROUTES.categorias, icon: LayoutGrid },
  { label: 'Cantantes', href: ROUTES.cantante, icon: Mic },
  { label: 'Grupos', href: ROUTES.grupo, icon: Users },
  { label: 'Inscripciones', href: ROUTES.inscripciones, icon: FileText },
  { label: 'Reserva de Asientos', href: ROUTES.asientosReserva, icon: Armchair },
  { label: 'Realidad Virtual', href: ROUTES.realidadVirtual, icon: Glasses },
  { label: 'Votación Previa', href: ROUTES.votacionPrevia, icon: CheckSquare },
  { label: 'Votación en Vivo', href: ROUTES.votacionVivo, icon: Radio },
];

export function Navbar() {
  const pathname = usePathname();
  const [openFlyout, setOpenFlyout] = useState<number | null>(null);

  return (
    <header className="sticky top-0 z-50">
      {/* Desktop */}
      <nav className="hidden h-[88px] items-center justify-between gap-7 border-b border-[#e0a527]/18 bg-[#170406]/95 px-8 lg:flex">
        <Link href={ROUTES.home} className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#f4c94f] to-[#e11d2e]">
            <Music2 size={18} className="text-[#200308]" />
          </span>
          <span className="whitespace-nowrap text-[17px] font-extrabold tracking-tight text-[#fdf6ec]">
            Aquí Canta Bolivia
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-center gap-1">
          {links.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors duration-200 ${
                  active
                    ? 'border-[#e0a527]/30 bg-[#e0a527]/15 text-[#f4c94f]'
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
          className="inline-flex shrink-0 items-center rounded-lg bg-gradient-to-br from-[#f4c94f] to-[#e11d2e] px-5 py-2.5 text-sm font-semibold text-[#200308] shadow-md shadow-black/25 transition-all duration-300 hover:brightness-110"
        >
          Login
        </Link>
      </nav>

      {/* Mobile rail */}
      <nav className="fixed bottom-0 left-0 top-0 z-50 flex w-[84px] flex-col items-center overflow-y-auto border-r border-[#e0a527]/18 bg-[#170406]/95 py-5 lg:hidden">
        <Link
          href={ROUTES.home}
          className="mb-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#f4c94f] to-[#e11d2e]"
        >
          <Music2 size={18} className="text-[#200308]" />
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
                  className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border transition-colors duration-200 ${
                    active
                      ? 'border-[#e0a527]/30 bg-[#e0a527]/15 text-[#f4c94f]'
                      : open
                        ? 'border-[#fdf6ec]/20 bg-[#fdf6ec]/[0.09] text-[#fdf6ec]'
                        : 'border-transparent bg-[#fdf6ec]/[0.04] text-[#fdf6ec]/60'
                  }`}
                >
                  <Icon size={20} />
                </button>

                {open && (
                  <div className="absolute left-[54px] top-1/2 z-10 flex -translate-y-1/2 items-center">
                    <span className="-mr-1 h-2 w-2 rotate-45 border-b border-l border-[#e0a527]/40 bg-[#280a0f]" />
                    <Link
                      href={href}
                      onClick={() => setOpenFlyout(null)}
                      className="whitespace-nowrap rounded-lg border border-[#e0a527]/40 bg-[#280a0f] px-4 py-2.5 text-sm font-semibold text-[#fdf6ec] shadow-lg shadow-black/40"
                    >
                      {label}
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="my-4 h-px w-8 bg-[#e0a527]/18" />

        <Link
          href={ROUTES.login}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#f4c94f] to-[#e11d2e] text-[#200308] shadow-md shadow-black/25"
        >
          <LogIn size={19} />
        </Link>
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
