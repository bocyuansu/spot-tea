import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.email('請輸入正確的 Email 格式 !'),
});
