import { getDatabase } from '@/db/client';

// 連線的選擇與理由見 db/queries/admin/overview.ts

// 後台要看得到草稿與已下架的商品，所以不像前台那樣過濾 status
export async function listAdminProducts() {
  const db = await getDatabase('fresh');

  return db.query.product.findMany({
    with: {
      category: true,
      variants: { orderBy: { weightGrams: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// 後台的商品編輯頁；和 listAdminProducts 一樣不過濾 status
export async function getAdminProductById(id: string) {
  const db = await getDatabase('fresh');

  return db.query.product.findFirst({
    where: { id },
    with: {
      variants: { orderBy: { weightGrams: 'asc' } },
    },
  });
}

// 商品表單的分類下拉選單；前台的 listCategories 有快取，後台要看到剛新增的分類
export async function listAdminCategories() {
  const db = await getDatabase('fresh');

  return db.query.category.findMany({ orderBy: { name: 'asc' } });
}

export type AdminProduct = Awaited<ReturnType<typeof listAdminProducts>>[number];
export type AdminProductDetail = NonNullable<Awaited<ReturnType<typeof getAdminProductById>>>;
export type AdminCategory = Awaited<ReturnType<typeof listAdminCategories>>[number];
