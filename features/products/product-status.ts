import type { product } from '@/db/schema';

type Product = typeof product.$inferSelect;

export const productStatusLabels: Record<Product['status'], string> = {
  draft: '草稿',
  published: '已上架',
  archived: '已下架',
};
