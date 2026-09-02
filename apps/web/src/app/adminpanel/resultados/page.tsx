import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';

export default function AdminResultadosPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Panel Admin" title="Resultados" description="Consulta los resultados del concurso." />

      <div className="mt-12! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
        Esta sección está en construcción.
      </div>
    </PageShell>
  );
}
