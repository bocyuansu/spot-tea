import { count } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { order } from '@/db/schema';

// 連線的選擇與理由見 db/queries/admin/overview.ts

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

export type AdminUser = Awaited<ReturnType<typeof listAdminUsers>>[number];
