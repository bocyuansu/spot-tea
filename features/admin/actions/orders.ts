'use server';

import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { order } from '@/db/schema';
import { createAuth } from '@/lib/auth';
import {
  adminOrderStatusSchema,
  type AdminOrderStatusValues,
} from '@/features/admin/schemas/order';

export type ActionResult = { ok: true } | { ok: false; message: string };

/**
 * server action 等同一個公開的 POST endpoint，(admin)/layout.tsx 的角色判斷擋不到它，
 * 所以每個 action 都要自己再確認一次身分。
 */
async function isAdmin() {
  const auth = await createAuth();

  const session = await auth.api.getSession({ headers: await headers() });

  return session?.user.role === 'admin';
}

/**
 * 訂單狀態與付款狀態一起更新。目前沒有金流串接，ATM 匯款到帳與貨到付款的收款
 * 都靠店家在這裡手動確認，所以不設狀態轉移限制，七種狀態都能直接選。
 *
 * 取消訂單刻意不自動回補庫存：要不要補貨是另一個判斷（出貨了嗎？破損嗎？）。
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
