import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { AdminPage } from './_components/AdminPage';

const SECCIONES = [
  { href: ROUTES.admin.inscritos, titulo: 'Inscritos', descripcion: 'Revisa, filtra y edita las postulaciones — cantantes y grupos.' },
  { href: ROUTES.admin.vistas, titulo: 'Vistas', descripcion: 'Activa o desactiva secciones del sitio público.' },
  {
    href: ROUTES.admin.sellos,
    titulo: 'Sellos',
    descripcion: 'Trayectos, eventos, puntos de escaneo, rangos y medallas.',
  },
  { href: ROUTES.admin.resultados, titulo: 'Resultados', descripcion: 'Resultados y calificaciones del jurado.' },
  { href: ROUTES.admin.usuarios, titulo: 'Usuarios', descripcion: 'Cuentas con acceso al panel de administración.' },
];

export default function AdminPanelPage() {
  return (
    <AdminPage title="Panel de administración" description="Gestión general del festival.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECCIONES.map((seccion) => (
          <Link
            key={seccion.href}
            href={seccion.href}
            className="rounded-xl border border-(--border) bg-white p-4! transition-colors duration-200 hover:border-(--brand-rojo)/40"
          >
            <p className="font-bold text-(--text-primary)">{seccion.titulo}</p>
            <p className="mt-0.5! text-sm text-(--text-secondary)">{seccion.descripcion}</p>
          </Link>
        ))}
      </div>
    </AdminPage>
  );
}
