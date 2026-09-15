'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { fetchUsuarioActual, logout, type UsuarioAutenticado } from '@/lib/auth';

// Pestañas para moverse entre las secciones del panel sin volver al índice
// (/adminpanel). Viven acá, en el layout, para aparecer en todas las
// sub-rutas — cada page.tsx de sección no tiene que repetirlas.
const SECCIONES = [
  { href: ROUTES.admin.root, label: 'Inicio' },
  { href: ROUTES.admin.inscritos, label: 'Inscritos' },
  { href: ROUTES.admin.vistas, label: 'Vistas' },
  { href: ROUTES.admin.sellos, label: 'Sellos' },
  { href: ROUTES.admin.categorias, label: 'Categorías' },
  { href: ROUTES.admin.resultados, label: 'Resultados' },
  { href: ROUTES.admin.usuarios, label: 'Usuarios' },
];

// Envuelve TODAS las rutas /adminpanel/* (Next.js aplica un layout.tsx a
// todo lo anidado bajo su carpeta) — un solo lugar para exigir sesión de
// admin en vez de repetir el chequeo en cada page.tsx. La verificación es
// del lado del cliente porque el token vive en localStorage (ver lib/auth.ts);
// la protección real de todas formas la hace la API con JwtAuthGuard/RolesGuard
// en cada endpoint — esto es solo para no mostrar la pantalla de admin antes
// de saber si hay sesión válida.
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    fetchUsuarioActual().then((actual) => {
      if (cancelado) return;
      if (actual && actual.role === 'ADMIN') {
        setUsuario(actual);
        setVerificando(false);
      } else {
        router.replace(`${ROUTES.login}?next=${encodeURIComponent(pathname)}`);
      }
    });

    return () => {
      cancelado = true;
    };
  }, [router, pathname]);

  if (verificando || !usuario) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-(--border) bg-(--bg-secondary) px-6! py-3!">
        <span className="text-sm text-(--text-secondary)">
          Conectado como <span className="font-bold text-(--text-primary)">{usuario.name ?? usuario.email}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            logout();
            router.replace(ROUTES.login);
          }}
          className="rounded-full border border-(--border) px-4! py-1.5! text-xs font-bold text-(--text-secondary) transition-colors duration-200 hover:text-(--text-primary)"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-(--border) bg-(--bg-secondary) px-6! py-3!">
        {SECCIONES.map(({ href, label }) => {
          const activo = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-lg border px-4! py-2! text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                activo
                  ? 'border-(--border-active) bg-[rgba(30,99,184,0.1)] text-(--text-primary)'
                  : 'border-transparent text-(--text-secondary) hover:bg-(--bg-card-hover) hover:text-(--text-primary)'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
