import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';

export default function PerfilPage() {
  return (
    <PageShell maxWidth="max-w-3xl">
      <PageHero title="Mi perfil" description="Gestiona tus datos e inscripciones." />

      <div className="mt-12! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
        Esta sección está en construcción.
      </div>
    </PageShell>
  );
}
