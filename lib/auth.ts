import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';
import { getDatabase } from '@/db/client';
import { kvSecondaryStorage } from '@/lib/auth-storage';
import * as schema from '@/db/schema';
import { hashPassword, verifyPassword } from '@/lib/password';
import { adminRoles } from '@/lib/permissions';
import { sendEmail } from '@/lib/email';
import {
  authPageUrl,
  resetPasswordEmail,
  verificationEmail,
} from '@/features/auth/emails';
import { waitUntil } from 'cloudflare:workers';

export async function createAuth() {
  const db = await getDatabase('fresh');

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
    }),
    secondaryStorage: kvSecondaryStorage,
    session: {
      // DB 為主、KV 當快取：KV 查不到會回 DB 查，上線前登入的 session 不會失效
      storeSessionInDatabase: true,
    },
    verification: {
      // KV 沒有原子的 getAndDelete，驗證碼留在 DB
      storeInDatabase: true,
    },
    rateLimit: {
      // 有 secondaryStorage 時預設會改用它；KV 沒有原子 increment，每個請求寫一次也會耗光每日寫入額度
      storage: 'memory',
    },
    // 寄信照官方文件不 await（避免 timing attack），並依文件對 serverless 的說明
    // 交給 waitUntil，讓 Worker 回應之後仍然把信寄完。
    // 信裡的連結用 token 另外組，不用 Better Auth 給的 url（原因見 features/auth/emails.ts）
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      // 跟修改密碼的 revokeOtherSessions 同理：密碼換了，舊的 session 全部失效
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url, token }) => {
        waitUntil(
          sendEmail({
            to: user.email,
            ...resetPasswordEmail(authPageUrl(url, '/reset-password', token)),
          }),
        );
      },
      // 預設的 scrypt 在 workerd 會撞到 CPU limit，改用 lib/password.ts 的 PBKDF2
      password: {
        hash: hashPassword,
        verify: verifyPassword,
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      // 沒驗證就登入會被擋下，同時自動再寄一封，等於「重寄驗證信」
      sendOnSignIn: true,
      sendVerificationEmail: async ({ user, url, token }) => {
        waitUntil(
          sendEmail({
            to: user.email,
            ...verificationEmail(authPageUrl(url, '/verify-email', token)),
          }),
        );
      },
    },
    baseURL: {
      allowedHosts: [
        'localhost:3000',
        'localhost:8787',
        'spot-tea.cyuan.workers.dev',
      ],
      protocol: 'auto',
    },
    advanced: {
      // 避免 Cloudflare Network connection lost
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
