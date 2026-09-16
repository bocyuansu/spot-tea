import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('請輸入正確的 Email 格式 !'),
  password: z.string().min(1, '請輸入密碼 !'),
});
