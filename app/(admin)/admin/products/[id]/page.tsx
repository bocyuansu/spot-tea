import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminProductById, listAdminCategories } from '@/db/queries/admin';
import AdminProductForm from '@/features/admin/components/AdminProductForm';

export const metadata: Metadata = {
  title: '編輯商品',
};

type AdminProductEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProductEditPage({ params }: AdminProductEditPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([getAdminProductById(id), listAdminCategories()]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">編輯商品</h1>
        <p className="mt-1 text-muted-foreground">{product.name}</p>
      </div>

      <AdminProductForm categories={categories} product={product} />
    </div>
  );
}
