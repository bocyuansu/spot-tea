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
        variants: true,
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

// 在 products/[slug]/page.tsx 會在 generateMetadata 和 Page 呼叫
export const getPublishedProductBySlug = unstable_cache(
  async (slug: string) => {
    const db = await getDatabase('fresh');

    return db.query.product.findFirst({
      where: {
        slug,
        status: 'published',
      },
      with: {
        category: true,
        variants: true,
      },
    });
  },
  ['productBySlug'],
  {
    // 同樣內嵌了 category，且和列表共用 products：商品異動時兩份都要一起失效
    tags: ['products', 'categories'],
    revalidate: 3600,
  },
);

export type ProductWithDetails = Awaited<ReturnType<typeof listPublishedProducts>>[number];
