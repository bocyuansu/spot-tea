import { z } from 'zod';

// admin plugin 的 defaultRole 是 customer，後台只需要在這兩個角色之間切換
export const adminUserRoles = ['customer', 'admin'] as const;

export const adminUserRoleLabels: Record<(typeof adminUserRoles)[number], string> = {
  customer: '一般會員',
  admin: '管理員',
};

export const adminUserStatusLabels = {
  active: '正常',
  banned: '已停權',
} as const;

// 用戶名稱與密碼的規則跟前台註冊一致，避免同一個欄位有兩套標準
const name = z.string().min(3, '用戶名稱至少 3 個字 !').max(20, '用戶名稱不得超過 20 個字 !');

export const adminCreateUserSchema = z.object({
  name,
  email: z.email('請輸入正確的 Email 格式 !'),
  password: z.string().min(8, '密碼長度至少 8 個字 !').max(20, '密碼長度不得超過 20 個字 !'),
  role: z.enum(adminUserRoles),
});

export const adminUpdateUserSchema = z.object({
  name,
  role: z.enum(adminUserRoles),
  status: z.enum(['active', 'banned']),
});

export type AdminCreateUserValues = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserValues = z.infer<typeof adminUpdateUserSchema>;
