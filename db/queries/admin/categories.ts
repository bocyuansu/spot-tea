import { getDatabase } from '@/db/client';

// 連線的選擇與理由見 db/queries/admin/overview.ts

/**
 * 分類管理頁；商品表單下拉選單用的純清單是 db/queries/admin/products.ts
 * 的 listAdminCategories，那裡不需要商品數。
 */
export async function listAdminCategoriesWithCounts() {
  const db = await getDatabase('fresh');

  // 刪除分類的確認對話框要列出哪些商品會變成未分類，所以每個分類帶上底下商品的名稱；
  // 只撈 id 與名稱，商品數也直接從這份清單算
  const categories = await db.query.category.findMany({
    with: {
      products: {
        columns: { id: true, name: true },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  return categories.map((row) => ({
    ...row,
    productCount: row.products.length,
  }));
}

export type AdminCategoryWithCount = Awaited<
  ReturnType<typeof listAdminCategoriesWithCounts>
>[number];
