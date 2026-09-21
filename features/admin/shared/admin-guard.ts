import { headers } from 'next/headers';
import { createAuth } from '@/lib/auth';

/**
 * server action 等同一個公開的 POST endpoint，(admin)/layout.tsx 的角色判斷擋不到它，
 * 所以每個 action 都要自己再確認一次身分。
 *
 * 需要知道「是誰」操作的 action（例如記錄訂單由誰更新）用這個，不是管理員回 null。
 */
export async function getAdminUser() {
  const auth = await createAuth();

  const session = await auth.api.getSession({ headers: await headers() });

  return session?.user.role === 'admin' ? session.user : null;
}

export async function isAdmin() {
  return (await getAdminUser()) !== null;
}
