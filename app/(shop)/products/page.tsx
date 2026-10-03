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

  const [categories, products] = await Promise.all([
    listCategories(),
    listPublishedProducts(''),
  ]);
  const activeCategory = categories.find((row) => row.slug === category);

  // 分類、關鍵字、頁碼都不進快取，只在記憶體裡篩選、切頁：
  // listPublishedProducts 的每個參數都是一個 KV key，任何人亂打的 ?category= 都會多一次 KV 寫入，
  // Cloudflare Free 方案每天只有 1,000 次。整份型錄只佔一個 key，首頁和商品詳情頁也共用。
  // 關鍵字先篩，茶區膠囊上的款數才會跟點下去看到的一致；不存在的分類自然篩出空列表
  const searchedProducts = searchProducts(products, query);
  const matchedProducts = category
    ? searchedProducts.filter((product) => product.category?.slug === category)
    : searchedProducts;
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
            從平地到高山，一起探索台灣各地茶區的嚴選好茶
          </p>
        </div>
        <ProductSearch
          query={query}
          activeCategorySlug={activeCategory?.slug}
        />
      </div>

      <Categories
        categories={categories}
        products={searchedProducts}
        showAll
        activeCategorySlug={category}
        query={query}
      />

      {query && (
        <p className="text-sm text-muted-foreground">
          搜尋「{query}」共 {matchedProducts.length} 件商品．
          <Link
            href={getProductsHref({ category: activeCategory?.slug })}
            prefetch={false}
            className="text-primary-strong underline-offset-4 hover:underline"
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
