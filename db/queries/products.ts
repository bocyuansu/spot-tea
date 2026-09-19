import { getDatabase } from '@/db/client';
import { unstable_cache } from 'next/cache';

export const listCategories = unstable_cache(
  async () => {
    const db = await getDatabase('fresh');

    return db.query.category.findMany({
      orderBy: { name: 'asc' },
    });
  },
  ['categories'],
  {
    revalidate: 3600,
    tags: ['categories'],
  },
);

export const listPublishedProducts = unstable_cache(
  async (categorySlug?: string) => {
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
    tags: ['productBySlug', 'categories'],
    revalidate: 3600,
  },
);

export type ProductWithDetails = Awaited<ReturnType<typeof listPublishedProducts>>[number];
