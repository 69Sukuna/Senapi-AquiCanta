import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

const links = [
  { label: 'Inicio', href: ROUTES.home },
  { label: 'Categorías', href: ROUTES.categorias },
  { label: 'Cantantes', href: ROUTES.cantante },
  { label: 'Grupos', href: ROUTES.grupo },
  { label: 'Inscripciones', href: ROUTES.inscripciones },
  { label: 'Reserva de Asientos', href: ROUTES.asientosReserva },
  { label: 'Realidad Virtual', href: ROUTES.realidadVirtual },
  { label: 'Votación Previa', href: ROUTES.votacionPrevia },
  { label: 'Votación en Vivo', href: ROUTES.votacionVivo },
  { label: 'Jurado', href: ROUTES.calificacionJurado },
  { label: 'Login', href: ROUTES.login },
];

export function Navbar() {
  return (
    <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-800 px-6 py-4">
      <Link href={ROUTES.home} className="mr-4 font-bold">
        Aqui Canta Bolivia
      </Link>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="text-sm text-slate-300 hover:text-white">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
