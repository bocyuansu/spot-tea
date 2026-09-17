import { getDatabase } from '@/db/client';

export async function listPublishedProducts(categorySlug?: string) {
  const db = getDatabase();

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

export async function getPublishedProductBySlug(slug: string) {
  const db = getDatabase();

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
  const db = getDatabase();

  return db.query.category.findMany({
    orderBy: { name: 'asc' },
  });
}

export type ProductWithDetails = Awaited<ReturnType<typeof listPublishedProducts>>[number];
