import { getDatabase } from '@/db/client';
import { cache } from 'react';

export async function listPublishedProducts(categorySlug?: string) {
  const db = await getDatabase();

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
}

// 在 product/[slug]/page.tsx 會在 generateMetadata 和 Page 呼叫
export const getPublishedProductBySlug = cache(async (slug: string) => {
  const db = await getDatabase();

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
});

export async function listCategories() {
  const db = await getDatabase();

  return db.query.category.findMany({
    orderBy: { name: 'asc' },
  });
}

export type ProductWithDetails = Awaited<ReturnType<typeof listPublishedProducts>>[number];
