import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';
import { ROUTES } from '@/lib/routes';

const SECCIONES = [
  { href: ROUTES.admin.inscritos, titulo: 'Inscritos', descripcion: 'Revisa, filtra y edita las postulaciones — cantantes y grupos.' },
  { href: ROUTES.admin.vistas, titulo: 'Vistas', descripcion: 'Activa o desactiva secciones del sitio público.' },
  {
    href: ROUTES.admin.sellos,
    titulo: 'Sellos',
    descripcion: 'Trayectos, eventos, puntos de escaneo, rangos y medallas.',
  },
  { href: ROUTES.admin.categorias, titulo: 'Categorías', descripcion: 'Gestión de las categorías del concurso.' },
  { href: ROUTES.admin.resultados, titulo: 'Resultados', descripcion: 'Resultados y calificaciones del jurado.' },
  { href: ROUTES.admin.usuarios, titulo: 'Usuarios', descripcion: 'Cuentas con acceso al panel de administración.' },
];

export default function AdminPanelPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Panel Admin" title="Panel de administración" description="Gestión general del festival." />

      <div className="mt-10! grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECCIONES.map((seccion) => (
          <Link
            key={seccion.href}
            href={seccion.href}
            className="rounded-2xl border border-(--border) bg-(--bg-card) p-5! transition-colors duration-200 hover:border-[#1e63b8]/40"
          >
            <p className="font-bold text-(--text-primary)">{seccion.titulo}</p>
            <p className="mt-1! text-sm text-(--text-secondary)">{seccion.descripcion}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
