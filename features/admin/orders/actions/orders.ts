'use server';

import { and, eq, inArray, or } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { order } from '@/db/schema';
import type { ActionResult } from '@/features/admin/shared/action-result';
import { getAdminUser } from '@/features/admin/shared/admin-guard';
import {
  adminOrderStatusSchema,
  adminPaymentStatusSchema,
  type AdminOrderStatus,
  type AdminPaymentStatus,
} from '@/features/admin/orders/schemas/order';
import {
  getPreviousStatuses,
  orderStatusTransitions,
  paymentStatusTransitions,
} from '@/features/orders/order-status';

const STALE_ORDER_MESSAGE = '訂單狀態已經變更，請重新整理後再試 !';

/**
 * 把訂單狀態推到下一步（待處理 → 備貨中 → 已出貨 → 已完成，出貨前可取消），
 * 能走哪一步只看 orderStatusTransitions。
 *
 * 「可以從哪些狀態走過來」直接寫進 UPDATE 的條件：畫面過期、兩個人同時按、
 * 或有人繞過畫面亂送，都只會命中 0 列，不會把別人剛改的狀態蓋回去。
 * 信用卡與 ATM 匯款要先收到錢才能開始備貨，條件與 isAwaitingPrepayment 相同。
 *
 * 取消訂單刻意不自動回補庫存：要不要補貨是另一個判斷（出貨了嗎？破損嗎？）；
 * 同理，取消也不會自動把付款狀態改成已退款，退款要另外確認。
 */
export async function transitionOrderStatus(
  id: string,
  next: AdminOrderStatus,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, message: '沒有權限執行這個操作 !' };

  const parsed = adminOrderStatusSchema.safeParse(next);
  if (!parsed.success) return { ok: false, message: '欄位格式有誤，請重新檢查 !' };

  // 待處理是起點，沒有任何一步能走回去
  const from = getPreviousStatuses(orderStatusTransitions, parsed.data);
  if (from.length === 0) return { ok: false, message: '訂單狀態不能這樣變更 !' };

  const db = await getDatabase('fresh');

  try {
    const [updated] = await db
      .update(order)
      .set({ status: parsed.data, updatedById: admin.id })
      .where(
        and(
          eq(order.id, id),
          inArray(order.status, from),
          parsed.data === 'processing'
            ? or(eq(order.paymentProvider, 'cod'), eq(order.paymentStatus, 'paid'))
            : undefined,
        ),
      )
      .returning({ id: order.id });

    if (!updated) return { ok: false, message: STALE_ORDER_MESSAGE };
  } catch {
    return { ok: false, message: '更新失敗，請稍後再試 !' };
  }

  // 訂單資料沒有經過 unstable_cache，不需要 updateTag
  return { ok: true };
}

/**
 * 把付款狀態推到下一步：收到款項標記已付款，退完款標記已退款。
 *
 * 綠界信用卡通常由付款通知自動入帳，這裡給貨到付款、ATM 匯款，
 * 以及綠界要求到後台人工確認的交易補記用。退款要先在綠界後台或銀行完成，這裡只記錄結果。
 * 併發的處理方式和 transitionOrderStatus 相同。
 */
export async function transitionPaymentStatus(
  id: string,
  next: AdminPaymentStatus,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, message: '沒有權限執行這個操作 !' };

  const parsed = adminPaymentStatusSchema.safeParse(next);
  if (!parsed.success) return { ok: false, message: '欄位格式有誤，請重新檢查 !' };

  // 未付款與付款失敗是起點，沒有任何一步能走回去
  const from = getPreviousStatuses(paymentStatusTransitions, parsed.data);
  if (from.length === 0) return { ok: false, message: '付款狀態不能這樣變更 !' };

  const db = await getDatabase('fresh');

  try {
    const [updated] = await db
      .update(order)
      .set({ paymentStatus: parsed.data, updatedById: admin.id })
      .where(and(eq(order.id, id), inArray(order.paymentStatus, from)))
      .returning({ id: order.id });

    if (!updated) return { ok: false, message: STALE_ORDER_MESSAGE };
  } catch {
    return { ok: false, message: '更新失敗，請稍後再試 !' };
  }

  return { ok: true };
}
