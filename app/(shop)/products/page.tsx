import type { Metadata } from 'next';
import Categories from '@/features/products/components/Categories';
import ProductList from '@/features/products/components/ProductList';
import { listCategories, listPublishedProducts } from '@/db/queries/products';

export const metadata: Metadata = {
  title: '所有商品',
  description: '找茶 所有商品',
};

type ProductsPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;

  const [categories, products] = await Promise.all([
    listCategories(),
    listPublishedProducts(category ?? ''),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">所有商品</h1>
        <p className="mt-1 text-muted-foreground">探索台灣四大茶區的嚴選好茶</p>
      </div>

      <Categories categories={categories} activeCategorySlug={category} />

      <ProductList products={products} activeCategorySlug={category} />
    </div>
  );
}
