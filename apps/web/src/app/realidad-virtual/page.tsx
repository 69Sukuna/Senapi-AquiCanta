import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';

export default function RealidadVirtualPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Experiencia" title="Realidad Virtual" description="Recorre el Teatro Internacional de Oruro en 360°." />

      <div className="mt-12! rounded-2xl border border-dashed border-[rgba(224,165,39,0.3)] p-10! text-center text-[rgba(253,246,236,0.6)]">
        Esta sección está en construcción.
      </div>
    </PageShell>
  );
}
