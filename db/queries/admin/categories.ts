import { count } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { product } from '@/db/schema';

// 連線的選擇與理由見 db/queries/admin/overview.ts

/**
 * 分類管理頁；商品表單下拉選單用的純清單是 db/queries/admin/products.ts
 * 的 listAdminCategories，那裡不需要商品數。
 */
export async function listAdminCategoriesWithCounts() {
  const db = await getDatabase('fresh');

  // 商品數另外用 group by 撈再併回來，避免把每個分類的商品整包拉出來
  const [categories, productCounts] = await Promise.all([
    db.query.category.findMany({ orderBy: { name: 'asc' } }),
    db
      .select({ categoryId: product.categoryId, productCount: count() })
      .from(product)
      .groupBy(product.categoryId),
  ]);

  // 未分類商品會落在 categoryId 為 null 的那一組，對不到任何分類 id
  const productCountByCategoryId = new Map(
    productCounts.map((row) => [row.categoryId, row.productCount]),
  );

  return categories.map((row) => ({
    ...row,
    productCount: productCountByCategoryId.get(row.id) ?? 0,
  }));
}

export type AdminCategoryWithCount = Awaited<
  ReturnType<typeof listAdminCategoriesWithCounts>
>[number];
