import { z } from 'zod';

/**
 * 大頭貼和商品圖片走同一條路：server action 簽一張短效的上傳票，
 * 瀏覽器直接 PUT 到 Neon Object Storage，檔案不經過 Worker。
 */
export const avatarContentTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const avatarMaxBytes = 5 * 1024 * 1024;

// 簽名前先擋一次：action 是公開的 endpoint，<input accept> 只是前端的提示
export const avatarUploadSchema = z.object({
  contentType: z.enum(avatarContentTypes, {
    error: '只接受 JPG、PNG、WebP 或 AVIF 圖片 !',
  }),
  size: z
    .number()
    .int()
    .positive('檔案是空的 !')
    .max(avatarMaxBytes, '圖片不能超過 5MB !'),
});

/** 瀏覽器直接把 File 的欄位丟過來，還沒驗之前不能假設 contentType 是允許的那幾種 */
export type AvatarUploadInput = {
  contentType: string;
  size: number;
};

/**
 * 成功時 uploadUrl 給瀏覽器 PUT，url 是之後要寫進使用者資料的公開網址。
 * 'use server' 檔案只能 export async function，所以型別放在這裡。
 */
export type AvatarUploadTicket =
  | { ok: true; uploadUrl: string; url: string }
  | { ok: false; message: string };
