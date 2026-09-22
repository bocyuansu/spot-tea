import { getDatabase } from '@/db/client';

/**
 * 會員自己的訂單一律走 HYPERDRIVE_FRESH（沒有查詢快取）：
 * 剛結帳完就要看得到新訂單，走有快取的連線可能會撈到結帳前的結果。
 */
export async function listUserOrders(userId: string) {
  const db = await getDatabase('fresh');

  return db.query.order.findMany({
    where: { userId },
    with: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// 訂單完成頁用。查詢綁著 userId，別人的訂單編號自然查不到，頁面就回 404
export async function getUserOrderByNumber(
  userId: string,
  orderNumber: string,
) {
  const db = await getDatabase('fresh');

  return db.query.order.findFirst({
    where: { userId, orderNumber },
    with: {
      items: true,
    },
  });
}

export type OrderWithItems = Awaited<ReturnType<typeof listUserOrders>>[number];
