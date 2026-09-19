import { headers } from 'next/headers';
import { createAuth } from '@/lib/auth';

/**
 * server action 等同一個公開的 POST endpoint，(admin)/layout.tsx 的角色判斷擋不到它，
 * 所以每個 action 都要自己再確認一次身分。
 */
export async function isAdmin() {
  const auth = await createAuth();

  const session = await auth.api.getSession({ headers: await headers() });

  return session?.user.role === 'admin';
}
