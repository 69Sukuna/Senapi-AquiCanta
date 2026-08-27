import { PageHeading } from '@/components/PageHeading';

interface CantantePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CantantePage({ params }: CantantePageProps) {
  const { slug } = await params;
  return <PageHeading title={`Cantante: ${slug}`} />;
}
