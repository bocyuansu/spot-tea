import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';
import { getDatabase } from '@/db/client';
import * as schema from '@/db/schema';
import { hashPassword, verifyPassword } from '@/lib/password';
import { adminRoles } from '@/lib/permissions';
import { waitUntil } from 'cloudflare:workers';

export async function createAuth() {
  const db = await getDatabase();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      // 預設的 scrypt 在 workerd 會撞到 CPU limit，改用 lib/password.ts 的 PBKDF2
      password: {
        hash: hashPassword,
        verify: verifyPassword,
      },
    },
    baseURL: {
      allowedHosts: ['localhost:3000', 'localhost:8787', 'spot-tea.cyuan.workers.dev'],
      protocol: 'auto',
    },
    advanced: {
      backgroundTasks: { handler: waitUntil },
    },
    plugins: [
      admin({
        defaultRole: 'customer',
        roles: adminRoles,
        // 後台停權原因是選填的，沒填就不要落下 plugin 內建的英文 "No reason"
        defaultBanReason: '未提供原因',
      }),
      nextCookies(),
    ], // 確保 nextCookies 是陣列的最後一個 plugin
  });
}
