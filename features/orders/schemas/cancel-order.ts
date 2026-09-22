import { z } from 'zod';

// 表單和 server action 共用同一份規則：action 是公開的 endpoint，不能只靠前端驗證。
// 取消原因必填，店家才知道顧客為什麼取消；只填空白也算沒填
export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(1, '請填寫取消原因 !').max(200, '取消原因不得超過 200 個字 !'),
});

export type CancelOrderValues = z.infer<typeof cancelOrderSchema>;
