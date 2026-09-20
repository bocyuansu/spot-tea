/**
 * Better Auth CLI 專用設定（`pnpm dlx auth@latest generate --config lib/auth-cli.ts`）。
 *
 * CLI 在純 Node 環境載入設定檔，無法載入 lib/auth.ts —— 它的 import 鏈會拉進
 * `cloudflare:workers` 與 Hyperdrive binding，只有 workerd 裡才存在。
 *
 * 新增會建表或加欄位的 plugin 時，記得同步這裡的 plugins。
 */
import { config } from 'dotenv';
import { betterAuth } from 'better-auth/minimal';
import { admin } from 'better-auth/plugins';
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/db/schema';
import { relations } from '@/db/relations';
import { postgresEnv } from '@/env';

// 加入 override: true 強制覆蓋已經被外部工具注入的環境變數
config({ path: '.env.local', override: true });

// 空字串或漏設都會在這裡就被擋下來，不會變成 pg 那句難追的 ENOTFOUND base
const { databaseUrlUnpooled } = postgresEnv();

// generate 只需要 schema，不會真的建立連線
const db = drizzle(databaseUrlUnpooled, { relations });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: 'customer',
    }),
  ],
});
