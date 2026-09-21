'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { getDepartamentoInfo } from '@/lib/departamentos';
import { fetchUsuarioActual, logout, type UsuarioAutenticado } from '@/lib/auth';
import { UsuarioAdminProvider } from './_components/UsuarioAdminContext';

// Pestañas para moverse entre las secciones del panel sin volver al índice
// (/adminpanel). Viven acá, en el layout, para aparecer en todas las
// sub-rutas — cada page.tsx de sección no tiene que repetirlas.
// `soloAdmin`: un USER (usuario de departamento) solo ve Inscritos.
const SECCIONES = [
  { href: ROUTES.admin.root, label: 'Inicio', soloAdmin: true },
  { href: ROUTES.admin.inscritos, label: 'Inscritos', soloAdmin: false },
  { href: ROUTES.admin.vistas, label: 'Vistas', soloAdmin: true },
  { href: ROUTES.admin.sellos, label: 'Sellos', soloAdmin: true },
  { href: ROUTES.admin.resultados, label: 'Resultados', soloAdmin: true },
  { href: ROUTES.admin.usuarios, label: 'Usuarios', soloAdmin: true },
];

function puedeVerRuta(usuario: UsuarioAutenticado, pathname: string) {
  if (usuario.role === 'ADMIN') return true;
  return pathname === ROUTES.admin.inscritos || pathname.startsWith(`${ROUTES.admin.inscritos}/`);
}

// Envuelve TODAS las rutas /adminpanel/* (Next.js aplica un layout.tsx a
// todo lo anidado bajo su carpeta) — un solo lugar para exigir sesión en
// vez de repetir el chequeo en cada page.tsx. La verificación es del lado
// del cliente porque el token vive en localStorage (ver lib/auth.ts); la
// protección real de todas formas la hace la API con JwtAuthGuard/RolesGuard
// en cada endpoint (y el filtro por departamento del USER, en el servidor) —
// esto es solo para no mostrar pantallas a las que no se tiene acceso.
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    fetchUsuarioActual().then((actual) => {
      if (cancelado) return;
      if (actual && (actual.role === 'ADMIN' || actual.role === 'USER')) {
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

  const permitido = usuario ? puedeVerRuta(usuario, pathname) : false;

  useEffect(() => {
    if (usuario && !permitido) router.replace(ROUTES.admin.inscritos);
  }, [usuario, permitido, router]);

  if (verificando || !usuario || !permitido) {
    return null;
  }

  const departamento = getDepartamentoInfo(usuario.departamento);

  return (
    <UsuarioAdminProvider value={usuario}>
      <div>
        <div className="flex items-center justify-between gap-3 border-b border-(--border) bg-(--bg-primary) px-6! py-2!">
          <span className="text-xs text-(--text-secondary)">
            Conectado como <span className="font-semibold text-(--text-primary)">{usuario.name ?? usuario.email}</span>
            {usuario.role === 'USER' && (
              <span className="ml-1.5! text-(--text-muted)">
                · {departamento ? `Departamento de ${departamento.label}` : 'Sin departamento asignado'}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace(ROUTES.login);
            }}
            className="shrink-0 text-xs font-semibold text-(--text-secondary) transition-colors duration-200 hover:text-(--brand-rojo)"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-(--border) bg-white px-4! sm:px-6!">
          {SECCIONES.filter((seccion) => usuario.role === 'ADMIN' || !seccion.soloAdmin).map(({ href, label }) => {
            const activo = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={activo ? 'page' : undefined}
                className={`shrink-0 border-b-2 px-3! py-3! text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                  activo
                    ? 'border-(--brand-rojo) text-(--text-primary)'
                    : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {children}
      </div>
    </UsuarioAdminProvider>
  );
}
