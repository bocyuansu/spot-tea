import { z } from 'zod';

// 規則與註冊時的用戶名稱一致，避免同一個欄位在兩個地方有兩套標準
export const updateProfileSchema = z.object({
  name: z.string().min(3, '用戶名稱至少 3 個字 !').max(20, '用戶名稱不得超過 20 個字 !'),
});
