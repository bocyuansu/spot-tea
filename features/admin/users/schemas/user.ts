import { z } from 'zod';

// admin plugin 的 defaultRole 是 customer，後台只需要在這兩個角色之間切換
export const adminUserRoles = ['customer', 'admin'] as const;

export const adminUserRoleLabels: Record<
  (typeof adminUserRoles)[number],
  string
> = {
  customer: '一般會員',
  admin: '管理員',
};

// 用戶名稱與密碼的規則跟前台註冊一致，避免同一個欄位有兩套標準
const name = z
  .string()
  .min(3, '用戶名稱至少 3 個字 !')
  .max(20, '用戶名稱不得超過 20 個字 !');

export const adminCreateUserSchema = z.object({
  name,
  email: z.email('請輸入正確的 Email 格式 !'),
  password: z
    .string()
    .min(8, '密碼長度至少 8 個字 !')
    .max(20, '密碼長度不得超過 20 個字 !'),
  role: z.enum(adminUserRoles),
});

// 停權交給 UserBanDialog（可以帶停權期限與原因），編輯只處理基本資料
export const adminUpdateUserSchema = z.object({
  name,
  role: z.enum(adminUserRoles),
});

// admin plugin 的 banUser 收的是 banExpiresIn（幾秒後自動解除），不帶就是永久停權
const DAY_IN_SECONDS = 60 * 60 * 24;

export const adminBanDurations = ['permanent', '1d', '7d', '30d'] as const;

export const adminBanDurationLabels: Record<
  (typeof adminBanDurations)[number],
  string
> = {
  permanent: '永久',
  '1d': '1 天',
  '7d': '7 天',
  '30d': '30 天',
};

export const adminBanDurationSeconds: Record<
  (typeof adminBanDurations)[number],
  number | undefined
> = {
  permanent: undefined,
  '1d': DAY_IN_SECONDS,
  '7d': 7 * DAY_IN_SECONDS,
  '30d': 30 * DAY_IN_SECONDS,
};

export const adminBanUserSchema = z.object({
  duration: z.enum(adminBanDurations),
  // 停權原因會顯示在被停權的會員登入時看到的訊息裡，留空就交給 admin plugin 的預設文案
  banReason: z.string().max(100, '停權原因不得超過 100 個字 !'),
});

export type AdminCreateUserValues = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserValues = z.infer<typeof adminUpdateUserSchema>;
export type AdminBanUserValues = z.infer<typeof adminBanUserSchema>;
