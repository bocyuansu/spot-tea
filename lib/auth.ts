import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';
import { getDatabase } from '@/db/client';
import * as schema from '@/db/schema';

export async function createAuth() {
  const db = await getDatabase();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    baseURL: {
      allowedHosts: ['localhost:3000', 'localhost:8787', 'spot-tea.cyuan.workers.dev'],
      protocol: 'auto',
    },
    advanced: {
      trustedProxyHeaders: true,
    },
    plugins: [
      admin({
        defaultRole: 'customer',
      }),
      nextCookies(),
    ], // 確保 nextCookies 是陣列的最後一個 plugin
  });
}
