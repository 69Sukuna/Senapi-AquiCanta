import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';
import { SellosAdminExplorer } from './_components/SellosAdminExplorer';

export default function AdminSellosPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Panel Admin"
        title="Sellos"
        description="Trayectos, eventos, puntos de escaneo, rangos y medallas del recorrido de sellos."
      />
      <SellosAdminExplorer />
    </PageShell>
  );
}
