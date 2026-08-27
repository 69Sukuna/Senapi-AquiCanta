import { PageHeading } from '@/components/PageHeading';

interface GrupoPageProps {
  params: Promise<{ slug: string }>;
}

export default async function GrupoPage({ params }: GrupoPageProps) {
  const { slug } = await params;
  return <PageHeading title={`Grupo: ${slug}`} />;
}
