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
  // Recent SDK versions default to embedding a checksum in presigned PUT
  // URLs computed from an empty body (since no body exists at presign
  // time), which rejects any upload with real content. This restores the
  // upload/download behavior below and the presigned PUT URL in
  // Objects (/docs/storage/objects#presigned-urls).
  requestChecksumCalculation: 'WHEN_REQUIRED',
});

// 型別綁在 neon.ts 的 buckets 上，打錯或是刪掉宣告都會編譯失敗
export const STORAGE_BUCKET: keyof NonNullable<typeof config.buckets> = 'images';

/**
 * 物件的公開網址：endpoint + bucket + key，
 * 例如 https://<branch>.storage.c-4.ap-southeast-1.aws.neon.tech/images/products/spot-tea.jpg
 */
export function storageObjectUrl(key: string) {
  return `${storage.endpoint}/${STORAGE_BUCKET}/${key}`;
}
