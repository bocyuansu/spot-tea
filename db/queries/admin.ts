import { count, eq, sum } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { order, product, user } from '@/db/schema';

// 庫存低於這個數字就列進儀表板的補貨提醒
export const LOW_STOCK_THRESHOLD = 10;

/**
 * 後台看到的必須是當下的資料，所以這裡一律走 HYPERDRIVE_FRESH（沒有查詢快取）
 * 的連線，也不像前台的 db/queries/products.ts 那樣包 unstable_cache。
 */
export async function getAdminOverview() {
  const db = await getDatabase('fresh');

  const [
    revenueRows,
    orderCount,
    userCount,
    publishedProductCount,
    recentOrders,
    lowStockVariants,
  ] = await Promise.all([
    db
      .select({ total: sum(order.totalAmount) })
      .from(order)
      .where(eq(order.paymentStatus, 'paid')),
    db.$count(order),
    db.$count(user),
    db.$count(product, eq(product.status, 'published')),
    db.query.order.findMany({
      with: {
        user: { columns: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      limit: 5,
    }),
    db.query.productVariant.findMany({
      where: { stock: { lt: LOW_STOCK_THRESHOLD } },
      with: {
        product: { columns: { name: true } },
      },
      orderBy: { stock: 'asc' },
      limit: 5,
    }),
  ]);

  return {
    // pg 的 sum() 回傳字串，一筆已付款訂單都沒有時是 null
    paidRevenue: Number(revenueRows[0]?.total ?? 0),
    orderCount,
    userCount,
    publishedProductCount,
    recentOrders,
    lowStockVariants,
  };
}

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

export async function listAdminUsers() {
  const db = await getDatabase('fresh');

  // 訂單數另外用 group by 撈再併回來，避免把每位會員的訂單整包拉出來
  const [users, orderCounts] = await Promise.all([
    db.query.user.findMany({ orderBy: { createdAt: 'desc' } }),
    db.select({ userId: order.userId, orderCount: count() }).from(order).groupBy(order.userId),
  ]);

  const orderCountByUserId = new Map(orderCounts.map((row) => [row.userId, row.orderCount]));

  return users.map((row) => ({
    ...row,
    orderCount: orderCountByUserId.get(row.id) ?? 0,
  }));
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

export async function getAdminUserById(id: string) {
  const db = await getDatabase('fresh');

  return db.query.user.findFirst({ where: { id } });
}

export type AdminOverview = Awaited<ReturnType<typeof getAdminOverview>>;
export type AdminProduct = Awaited<ReturnType<typeof listAdminProducts>>[number];
export type AdminUser = Awaited<ReturnType<typeof listAdminUsers>>[number];
export type AdminCategory = Awaited<ReturnType<typeof listAdminCategories>>[number];
export type AdminProductDetail = NonNullable<Awaited<ReturnType<typeof getAdminProductById>>>;
