import { PageHeading } from '@/components/PageHeading';

interface CategoriaDetallePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoriaDetallePage({ params }: CategoriaDetallePageProps) {
  const { slug } = await params;
  return <PageHeading title={`Categoría: ${slug}`} />;
}
