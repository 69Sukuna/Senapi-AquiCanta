import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';

export default function VotacionVivoPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Votación en vivo" title="Votación en vivo" description="Sigue y vota la competencia en tiempo real." />

      <div className="mt-12! rounded-2xl border border-dashed border-[rgba(224,165,39,0.3)] p-10! text-center text-[rgba(253,246,236,0.6)]">
        Esta sección está en construcción.
      </div>
    </PageShell>
  );
}
