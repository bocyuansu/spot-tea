import { getDatabase } from '@/db/client';
import { unstable_cache } from 'next/cache';

// unstable_cache 的結果會寫進 VINEXT_KV_CACHE（見 vite.config.ts 的 kvDataAdapter）。
// 第二個參數 keyParts 是 cache key 的命名空間，第三個參數的 tags 才是失效標籤，兩者不要混用。
export const listCategories = unstable_cache(
  async () => {
    const db = await getDatabase('fresh');

    return db.query.category.findMany({
      orderBy: { name: 'asc' },
    });
  },
  ['categories'],
  {
    tags: ['categories'],
    revalidate: 3600,
  },
);

export const listPublishedProducts = unstable_cache(
  async (categorySlug: string) => {
    const db = await getDatabase('fresh');

    return db.query.product.findMany({
      where: {
        status: 'published',
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      with: {
        category: true,
        // 不指定順序的話是 Postgres 的 heap 順序，後台每次儲存都 UPDATE 規格，按鈕順序就會亂跳
        variants: { orderBy: { weightGrams: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
  ['products'],
  {
    // 結果內嵌了 category（with.category），所以分類異動時這份快取也要失效
    tags: ['products', 'categories'],
    revalidate: 3600,
  },
);

/**
 * products/[slug]/page.tsx 的 generateMetadata 和 Page 都會呼叫。
 *
 * 刻意不為每個 slug 各包一份 unstable_cache，而是從整份上架清單裡找：
 * 那樣任何人亂打的 /products/<slug> 都會新增一個 KV key（連「查無商品」也會被快取），
 * Cloudflare Free 方案每天只有 1,000 次 KV 寫入。整份型錄只佔一個 key，
 * 失效也跟著 listPublishedProducts 的 products / categories 標籤走。
 */
export async function getPublishedProductBySlug(slug: string) {
  const products = await listPublishedProducts('');

  return products.find((product) => product.slug === slug);
}

export type ProductWithDetails = Awaited<
  ReturnType<typeof listPublishedProducts>
>[number];
