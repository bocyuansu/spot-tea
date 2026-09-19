import { eq, sum } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { order, product, user } from '@/db/schema';

// 庫存低於這個數字就列進儀表板的補貨提醒
export const LOW_STOCK_THRESHOLD = 10;

/**
 * 後台看到的必須是當下的資料，所以 db/queries/admin/ 底下一律走 HYPERDRIVE_FRESH
 *（沒有查詢快取）的連線，也不像前台的 db/queries/products.ts 那樣包 unstable_cache。
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

export type AdminOverview = Awaited<ReturnType<typeof getAdminOverview>>;
