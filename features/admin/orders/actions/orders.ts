'use server';

import { eq } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { order } from '@/db/schema';
import type { ActionResult } from '@/features/admin/shared/action-result';
import { isAdmin } from '@/features/admin/shared/admin-guard';
import {
  adminOrderStatusSchema,
  type AdminOrderStatusValues,
} from '@/features/admin/orders/schemas/order';

/**
 * 訂單狀態與付款狀態一起更新，但兩者管的是不同的事：訂單狀態只走貨與流程
 *（待處理 → 備貨中 → 已出貨 → 已完成，中途可取消），錢的部分一律記在付款狀態
 *（含退款）。所以「已出貨但還沒收到錢」是 shipped + unpaid 這種正常組合。
 *
 * 目前沒有金流串接，ATM 匯款到帳與貨到付款的收款都靠店家在這裡手動確認，
 * 兩組狀態都不設轉移限制，可以直接選。
 *
 * 取消訂單刻意不自動回補庫存：要不要補貨是另一個判斷（出貨了嗎？破損嗎？）；
 * 同理，取消也不會自動把付款狀態改成已退款，退款要另外確認。
 */
export async function updateOrderStatus(
  id: string,
  values: AdminOrderStatusValues,
): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: '沒有權限執行這個操作 !' };

  const parsed = adminOrderStatusSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: '欄位格式有誤，請重新檢查 !' };

  const db = await getDatabase('fresh');

  try {
    await db
      .update(order)
      .set({ status: parsed.data.status, paymentStatus: parsed.data.paymentStatus })
      .where(eq(order.id, id));
  } catch {
    return { ok: false, message: '更新失敗，請稍後再試 !' };
  }

  // 訂單資料沒有經過 unstable_cache，不需要 updateTag
  return { ok: true };
}
