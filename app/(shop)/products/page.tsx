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

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { category } = await searchParams;

  const categories = await listCategories();
  const activeCategory = categories.find((row) => row.slug === category);

  // 先確認分類存在才查：listPublishedProducts 的每個參數都是一個 KV key，
  // 放任意的 ?category= 進去，Cloudflare Free 方案每天 1,000 次的 KV 寫入很快就會被用完。
  // 不存在的分類和以前一樣顯示空列表，只是不再查詢也不寫快取
  const products =
    category && !activeCategory
      ? []
      : await listPublishedProducts(activeCategory?.slug ?? '');

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
