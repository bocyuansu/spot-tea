import { z } from 'zod';
import { parseEnv } from '@neon/env';
import config from '@/neon';

/**
 * 依 neon.ts 的宣告驗證 process.env，並把變數換成有型別的欄位，
 * 少一個或是拼錯都會在啟動時就炸掉，而不是變成 undefined 傳到別的地方。
 *
 * 兩邊都用挑選版（第二個參數）：不挑的話 parseEnv 連 DATABASE_URL 一起要求，
 * 但 Worker 是走 Hyperdrive binding 連資料庫，身上並沒有那個變數。
 * 包成 function 則是因為 Node 腳本要先用 dotenv 載入 .env.local 才驗得到。
 */
export function storageEnv() {
  return parseEnv(config, [
    'AWS_ENDPOINT_URL_S3',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
  ]).storage;
}

/** migrate / seed / Better Auth CLI 這些 Node 腳本要的直連（unpooled）連線字串 */
export function postgresEnv() {
  return parseEnv(config, ['DATABASE_URL_UNPOOLED']).postgres;
}

/**
 * ImageKit 只當 CDN，圖片本體還是放在 Neon Object Storage，
 * 所以這個變數不在 neon.ts 的宣告裡，parseEnv 管不到，改用 zod 自己驗一次。
 * 行為維持一致：少了或不是合法網址就當場報錯，而不是讓 undefined 流進網址字串。
 */
export function imagekitEnv() {
  const parsed = z
    .object({
      IMAGEKIT_URL_ENDPOINT: z.url('IMAGEKIT_URL_ENDPOINT 必須是完整的 URL endpoint !'),
    })
    .parse(process.env);

  return { urlEndpoint: parsed.IMAGEKIT_URL_ENDPOINT.replace(/\/$/, '') };
}
