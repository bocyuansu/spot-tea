'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { client, STORAGE_BUCKET } from '@/lib/s3-client';
import { imageUrl } from '@/lib/imagekit';
import { isAdmin } from '@/features/admin/shared/admin-guard';
import {
  productImageUploadSchema,
  type ProductImageUploadInput,
  type ProductImageUploadTicket,
} from '@/features/admin/products/schemas/product-image';

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

/**
 * 保留原檔名當前綴方便在 bucket 裡辨認，後面補亂數避免同名互相覆蓋。
 * 副檔名一律由 content type 決定，不沿用使用者給的那一段。
 */
function toFileName({
  fileName,
  contentType,
}: {
  fileName: string;
  contentType: string;
}) {
  const name =
    fileName
      .replace(/\.[^.]*$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'image';

  return `${name}-${crypto.randomUUID().slice(0, 8)}.${extensions[contentType]}`;
}

export async function createProductImageUploadUrl(
  input: ProductImageUploadInput,
): Promise<ProductImageUploadTicket> {
  if (!(await isAdmin()))
    return { ok: false, message: '沒有權限執行這個操作 !' };

  const parsed = productImageUploadSchema.safeParse(input);
  // 這裡的錯誤是使用者挑錯檔案，訊息要講清楚是哪一種
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0].message };

  const fileName = toFileName(parsed.data);

  try {
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: `products/${fileName}`,
        ContentType: parsed.data.contentType,
        ContentLength: parsed.data.size,
      }),
      // 只夠這次上傳用，不是能一直拿去寫 bucket 的網址
      { expiresIn: 300 },
    );

    // imageUrl() 回傳的就是寫入資料庫的圖片網址，資料夾要跟上面的 Key 一致
    return { ok: true, uploadUrl, url: imageUrl('products', fileName) };
  } catch {
    return { ok: false, message: '無法取得上傳網址，請稍後再試 !' };
  }
}
