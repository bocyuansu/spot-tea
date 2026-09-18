import { getDatabase } from '@/db/client';

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

// 在 products/[slug]/page.tsx 會在 generateMetadata 和 Page 呼叫
export async function getPublishedProductBySlug(slug: string) {
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
}

export async function listCategories() {
  const db = await getDatabase();

  return db.query.category.findMany({
    orderBy: { name: 'asc' },
  });
}

export type ProductWithDetails = Awaited<ReturnType<typeof listPublishedProducts>>[number];
