import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.email('請輸入正確的 Email 格式 !'),
  name: z.string().min(3, '用戶名稱至少 3 個字 !').max(20, '用戶名稱不得超過 20 個字 !'),
  password: z.string().min(8, '密碼長度至少 8 個字 !').max(20, '密碼長度不得超過 20 個字 !'),
});
