'use server';

import { updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { and, eq, inArray } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { order, orderEvent } from '@/db/schema';
import { createAuth } from '@/lib/auth';
import { getPreviousStatuses, orderStatusTransitions } from '@/features/orders/order-status';
import { restoreOrderStock } from '@/features/orders/restore-stock';
import { cancelOrderSchema, type CancelOrderValues } from '@/features/orders/schemas/cancel-order';

export type CancelOrderResult = { ok: true } | { ok: false; message: string };

/**
 * 顧客在「我的訂單」自行取消訂單，並留下取消原因。
 *
 * 規則與後台的取消相同：只能在出貨前（orderStatusTransitions），
 * 可以從哪些狀態取消直接寫進 UPDATE 的條件，同一筆交易裡寫歷程、補回庫存。
 * server action 等同一個公開的 POST endpoint，要自己確認身分；
 * UPDATE 綁著 userId，別人的訂單自然命中 0 列。
 *
 * 這不是管理員做的變更，updatedById 與歷程的 actorId 都寫 null。
 * 已付款的訂單取消後付款狀態仍是已付款，由後台完成退款再標記（見 isAwaitingRefund）。
 */
export async function cancelOrder(
  orderId: string,
  values: CancelOrderValues,
): Promise<CancelOrderResult> {
  const auth = await createAuth();

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return { ok: false, message: '請先登入再取消訂單 !' };

  const parsed = cancelOrderSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: '欄位格式有誤，請重新檢查 !' };

  const db = await getDatabase('fresh');

  try {
    const cancelled = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(order)
        .set({ status: 'cancelled', cancelReason: parsed.data.reason, updatedById: null })
        .where(
          and(
            eq(order.id, orderId),
            eq(order.userId, session.user.id),
            inArray(order.status, getPreviousStatuses(orderStatusTransitions, 'cancelled')),
          ),
        )
        .returning({ id: order.id });

      if (!row) return false;

      await tx.insert(orderEvent).values({ orderId: row.id, status: 'cancelled', actorId: null });
      await restoreOrderStock(tx, row.id);

      return true;
    });

    if (!cancelled) return { ok: false, message: '訂單狀態已經變更，請重新整理後再試 !' };
  } catch {
    return { ok: false, message: '取消失敗，請稍後再試 !' };
  }

  // 補了庫存，而前台的商品列表與單一商品查詢都內嵌 variants，兩份快取都要清
  updateTag('products');

  return { ok: true };
}
