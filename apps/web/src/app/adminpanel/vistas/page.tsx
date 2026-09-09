import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';
import { VistasSwitchList } from './_components/VistasSwitchList';
import type { ConfiguracionVista } from './_components/tipos';

async function getConfiguracionesVista(): Promise<ConfiguracionVista[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const res = await fetch(`${apiUrl}/configuraciones-vista`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function AdminVistasPage() {
  const vistas = await getConfiguracionesVista();

  return (
    <PageShell maxWidth="max-w-3xl">
      <PageHero
        eyebrow="Panel Admin"
        title="Vistas"
        description="Activa o desactiva secciones del sitio público sin necesidad de un deploy."
      />

      {vistas.length > 0 ? (
        <VistasSwitchList vistasIniciales={vistas} />
      ) : (
        <div className="mt-12! rounded-2xl border border-dashed border-(--border) p-10! text-center text-(--text-muted)">
          No se pudieron cargar las configuraciones de vista.
        </div>
      )}
    </PageShell>
  );
}
