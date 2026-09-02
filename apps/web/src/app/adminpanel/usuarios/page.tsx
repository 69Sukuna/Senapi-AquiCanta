import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';

export default function AdminUsuariosPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Panel Admin" title="Usuarios" description="Administra los usuarios de la plataforma." />

      <div className="mt-12! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
        Esta sección está en construcción.
      </div>
    </PageShell>
  );
}
