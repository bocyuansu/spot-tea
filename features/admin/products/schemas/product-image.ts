import { z } from 'zod';

/**
 * 上傳走 presigned URL：server action 只簽一張短效的上傳票，
 * 檔案由瀏覽器直接 PUT 到 Neon Object Storage，不經過 Worker
 * (Cloudflare 免費方案每個請求只有 10ms CPU，扛不了檔案轉手)。
 */
export const productImageContentTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const productImageMaxBytes = 5 * 1024 * 1024;

// 簽名前先擋一次：action 是公開的 endpoint，<input accept> 和檔案大小都只是前端的提示
export const productImageUploadSchema = z.object({
  fileName: z.string().min(1, '檔案名稱不正確 !').max(200, '檔案名稱太長 !'),
  contentType: z.enum(productImageContentTypes, {
    error: '只接受 JPG、PNG、WebP 或 AVIF 圖片 !',
  }),
  size: z.number().int().positive('檔案是空的 !').max(productImageMaxBytes, '圖片不能超過 5MB !'),
});

/** 瀏覽器直接把 File 的欄位丟過來，還沒驗之前不能假設 contentType 是允許的那幾種 */
export type ProductImageUploadInput = {
  fileName: string;
  contentType: string;
  size: number;
};

/**
 * 成功時 uploadUrl 給瀏覽器 PUT，url 是之後要存進資料庫的公開網址。
 * 'use server' 檔案只能 export async function，所以型別放在這裡。
 */
export type ProductImageUploadTicket =
  | { ok: true; uploadUrl: string; url: string }
  | { ok: false; message: string };
