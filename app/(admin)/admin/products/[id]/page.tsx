import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getAdminProductById,
  listAdminCategories,
} from '@/db/queries/admin/products';
import ProductForm from '@/features/admin/products/components/ProductForm';
import { getAdminUser } from '@/features/admin/shared/admin-guard';

export const metadata: Metadata = {
  title: '編輯商品',
};

type AdminProductEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProductEditPage({
  params,
}: AdminProductEditPageProps) {
  const { id } = await params;

  const admin = await getAdminUser();
  if (!admin) return null;

  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    listAdminCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">編輯商品</h1>
        <p className="mt-1 text-muted-foreground">{product.name}</p>
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}
