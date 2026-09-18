import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '請輸入目前的密碼 !'),
    newPassword: z.string().min(8, '密碼長度至少 8 個字 !').max(20, '密碼長度不得超過 20 個字 !'),
    confirmPassword: z.string().min(1, '請再次輸入新密碼 !'),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    error: '新密碼不能與目前的密碼相同 !',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: '兩次輸入的新密碼不一致 !',
    path: ['confirmPassword'],
  });
