import { adminAc, userAc } from 'better-auth/plugins/admin/access';

/**
 * admin plugin 內建的角色是 admin / user，這個專案用的是 admin / customer。
 * 照官方文件的做法把角色表交給 plugin（伺服器端與 authClient 兩邊都要給同一份），
 * 後台管理會員角色時型別才會是 'admin' | 'customer' 而不是內建的 'admin' | 'user'。
 * 權限內容沿用內建的：admin 有全部的使用者管理權限，customer 什麼都沒有。
 */
export const adminRoles = {
  admin: adminAc,
  customer: userAc,
};
