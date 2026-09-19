import { z } from 'zod';
// type-only 匯入：不要把 drizzle/pg-core 帶進 client bundle
import type { order } from '@/db/schema';

type Order = typeof order.$inferSelect;

/**
 * z.enum 需要字面 tuple，Record<Order['status'], string> 給不出來，
 * 所以這裡重寫一次，再用 satisfies 換取對 drizzle enum 的編譯期漂移防護。
 * 顯示用的中文字串仍然只有 features/orders/order-status.ts 那一份。
 */
export const adminOrderStatuses = [
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
  'refunded',
] as const satisfies readonly Order['status'][];

export const adminPaymentStatuses = [
  'unpaid',
  'paid',
  'failed',
  'refunded',
] as const satisfies readonly Order['paymentStatus'][];

export const adminOrderStatusSchema = z.object({
  status: z.enum(adminOrderStatuses),
  paymentStatus: z.enum(adminPaymentStatuses),
});

export type AdminOrderStatusValues = z.infer<typeof adminOrderStatusSchema>;
