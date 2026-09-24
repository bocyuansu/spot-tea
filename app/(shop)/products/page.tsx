import type { Metadata } from 'next';
import Link from 'next/link';
import Categories from '@/features/products/components/Categories';
import ProductList from '@/features/products/components/ProductList';
import ProductPagination from '@/features/products/components/ProductPagination';
import ProductSearch from '@/features/products/components/ProductSearch';
import { listCategories, listPublishedProducts } from '@/db/queries/products';
import {
  getProductsHref,
  paginate,
  searchProducts,
} from '@/features/products/product-catalog';

export const metadata: Metadata = {
  title: '所有商品',
  description: '找茶 所有商品',
};

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    q?: string | string[];
    page?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { category, q, page } = await searchParams;
  // 參數重複時（?q=a&q=b）會變成陣列，只接受單一字串
  const query = typeof q === 'string' ? q.trim() : '';

  const categories = await listCategories();
  const activeCategory = categories.find((row) => row.slug === category);

  // 先確認分類存在才查：listPublishedProducts 的每個參數都是一個 KV key，
  // 放任意的 ?category= 進去，Cloudflare Free 方案每天 1,000 次的 KV 寫入很快就會被用完。
  // 不存在的分類和以前一樣顯示空列表，只是不再查詢也不寫快取
  const products =
    category && !activeCategory
      ? []
      : await listPublishedProducts(activeCategory?.slug ?? '');

  // 關鍵字和頁碼同理不進快取，只在記憶體裡篩選、切頁
  const matchedProducts = searchProducts(products, query);
  const {
    items,
    page: currentPage,
    totalPages,
  } = paginate(matchedProducts, Number(page));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl">所有商品</h1>
          <p className="mt-1 text-muted-foreground">
            探索台灣四大茶區的嚴選好茶
          </p>
        </div>
        <ProductSearch
          query={query}
          activeCategorySlug={activeCategory?.slug}
        />
      </div>

      <Categories
        categories={categories}
        activeCategorySlug={category}
        query={query}
      />

      {query && (
        <p className="text-sm text-muted-foreground">
          搜尋「{query}」共 {matchedProducts.length} 件商品．
          <Link
            href={getProductsHref({ category: activeCategory?.slug })}
            prefetch={false}
            className="text-primary underline-offset-4 hover:underline"
          >
            清除搜尋
          </Link>
        </p>
      )}

      <ProductList
        products={items}
        activeCategorySlug={category}
        query={query}
      />

      <ProductPagination
        page={currentPage}
        totalPages={totalPages}
        activeCategorySlug={activeCategory?.slug}
        query={query}
      />
    </div>
  );
}
