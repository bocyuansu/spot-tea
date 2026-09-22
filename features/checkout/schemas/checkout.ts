import { z } from 'zod';
import { paymentMethods } from '@/features/orders/order-status';

// 表單和 server action 共用同一份規則：action 是公開的 endpoint，不能只靠前端驗證。
// 前六個欄位刻意對齊 order.shippingAddress 的 jsonb 形狀，建單時可以直接展開。
export const checkoutFormSchema = z.object({
  recipientName: z
    .string()
    .min(1, '請輸入收件人姓名 !')
    .max(20, '收件人姓名不得超過 20 個字 !'),
  phone: z.string().regex(/^09\d{8}$/, '請輸入正確的手機號碼 !'),
  postalCode: z.string().regex(/^\d{3,6}$/, '請輸入正確的郵遞區號 !'),
  city: z.string().min(1, '請輸入縣市 !').max(10, '縣市不得超過 10 個字 !'),
  district: z
    .string()
    .min(1, '請輸入鄉鎮市區 !')
    .max(10, '鄉鎮市區不得超過 10 個字 !'),
  addressLine: z
    .string()
    .min(1, '請輸入詳細地址 !')
    .max(100, '詳細地址不得超過 100 個字 !'),
  note: z.string().max(200, '備註不得超過 200 個字 !'),
  paymentMethod: z.enum(paymentMethods),
});

// 購物車存在 localStorage，只送規格與數量；品名、單價、庫存一律由 server 從資料庫重撈
const checkoutItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
});

export const createOrderSchema = checkoutFormSchema.extend({
  items: z
    .array(checkoutItemSchema)
    .min(1, '購物車是空的 !')
    .max(50, '購物車商品過多 !')
    // 同一個規格送兩筆可以繞過逐筆的庫存檢查，直接擋掉；正常的購物車不會產生重複
    .refine(
      (items) =>
        new Set(items.map((item) => item.variantId)).size === items.length,
      '購物車資料有誤，請重新整理 !',
    ),
  // 顧客在結帳頁看到的合計。只拿來比對，不會拿來計價：
  // 購物車的單價是加入當下的快照，商品改價後要先讓顧客看到新金額才能成立訂單
  expectedTotal: z.number().int().nonnegative(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
