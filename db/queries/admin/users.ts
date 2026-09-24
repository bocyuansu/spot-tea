import { count, sql } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { order } from '@/db/schema';

// 連線的選擇與理由見 db/queries/admin/overview.ts

export async function listAdminUsers() {
  const db = await getDatabase('fresh');

  // 訂單數與消費金額另外用 group by 撈再併回來，避免把每位會員的訂單整包拉出來
  const [users, orderStats] = await Promise.all([
    db.query.user.findMany({ orderBy: { createdAt: 'desc' } }),
    db
      .select({
        userId: order.userId,
        orderCount: count(),
        // 消費金額跟儀表板的營收一樣只算已付款的訂單，退款後就不再計入。
        // pg 的 sum() 回傳字串，沒有已付款訂單時是 null
        spentAmount:
          sql<number>`coalesce(sum(${order.totalAmount}) filter (where ${order.paymentStatus} = 'paid'), 0)`.mapWith(
            Number,
          ),
      })
      .from(order)
      .groupBy(order.userId),
  ]);

  const orderStatsByUserId = new Map(
    orderStats.map((row) => [row.userId, row]),
  );

  return users.map((row) => ({
    ...row,
    orderCount: orderStatsByUserId.get(row.id)?.orderCount ?? 0,
    spentAmount: orderStatsByUserId.get(row.id)?.spentAmount ?? 0,
  }));
}

export type AdminUser = Awaited<ReturnType<typeof listAdminUsers>>[number];
