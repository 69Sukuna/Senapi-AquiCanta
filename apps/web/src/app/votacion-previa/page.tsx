import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';

export default function VotacionPreviaPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Votación" title="Votación previa" description="Vota por tus favoritos antes de la gran final." />

      <div className="mt-12! rounded-2xl border border-dashed border-[rgba(224,165,39,0.3)] p-10! text-center text-[rgba(253,246,236,0.6)]">
        Esta sección está en construcción.
      </div>
    </PageShell>
  );
}
