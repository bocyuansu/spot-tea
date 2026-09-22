import { getSession } from '@/lib/session';

/**
 * 後台的身分確認不能只靠 (admin)/layout.tsx 的角色判斷，兩種入口都擋不到：
 *
 * - server action 等同一個公開的 POST endpoint，每個 action 都要自己再確認一次，
 *   用 getAdminUser() / isAdmin()。
 * - 頁面會被當成獨立的 element 一起序列化進 RSC payload，layout 回 AccessDenied
 *   只是不把它畫出來，查到的資料照樣送到瀏覽器，所以每個後台頁面在查詢前都要
 *   用 getAdminUser() 確認。
 */

/**
 * 需要知道「是誰」操作的 action（例如記錄訂單由誰更新）用這個，不是管理員回 null。
 *
 * 走 lib/session.ts 的 cache()：頁面和 layout 共用同一次 session 查詢，
 * 每個頁面再確認一次也不會多打一次資料庫。
 */
export async function getAdminUser() {
  const session = await getSession();

  return session?.user.role === 'admin' ? session.user : null;
}

export async function isAdmin() {
  return (await getAdminUser()) !== null;
}
