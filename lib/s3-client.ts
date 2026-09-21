import { S3Client } from '@aws-sdk/client-s3';
import { storageEnv } from '@/env';
import config from '@/neon';

const storage = storageEnv();

/**
 * Neon Object Storage 的 S3 相容 client。
 * 連線資訊由 `neon env pull` 寫進 .env.local，正式環境放在 Worker secrets；
 * Worker 開了 nodejs_compat，binding 與環境變數都拿得到 process.env。
 */
export const client = new S3Client({
  region: storage.region,
  endpoint: storage.endpoint,
  credentials: {
    accessKeyId: storage.accessKeyId,
    secretAccessKey: storage.secretAccessKey,
  },
  // Neon 的 storage gateway 只吃 path-style 定址
  forcePathStyle: true,
  // 最近的 SDK 版本預設會在預簽名（presigned）的 PUT URL 中嵌入校驗碼（checksum）
  // 該校驗碼是基於「空主體（empty body）」計算而來的（因為在進行預簽名時還不存在實際的主體內容）
  // 這會導致任何帶有實際內容的預先上傳遭到拒絕。
  // 此變更恢復了下方的上傳/下載行為，以及 Objects 文件中說明的預簽名 PUT URL 機制
  requestChecksumCalculation: 'WHEN_REQUIRED',
});

// 型別綁在 neon.ts 的 buckets 上，打錯或是刪掉宣告都會編譯失敗
export const STORAGE_BUCKET: keyof NonNullable<typeof config.buckets> = 'images';
