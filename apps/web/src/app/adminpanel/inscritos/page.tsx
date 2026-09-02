import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';

export default function AdminInscritosPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Panel Admin" title="Inscritos" description="Revisa y gestiona las inscripciones recibidas." />

      <div className="mt-12! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
        Esta sección está en construcción.
      </div>
    </PageShell>
  );
}
