import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';

export default function CalificacionJuradoPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Jurado" title="Calificación del jurado" description="Evalúa a los participantes del concurso." />

      <div className="mt-12! rounded-2xl border border-dashed border-[rgba(224,165,39,0.3)] p-10! text-center text-[rgba(253,246,236,0.6)]">
        Esta sección está en construcción.
      </div>
    </PageShell>
  );
}
