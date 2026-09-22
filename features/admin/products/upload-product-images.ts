import { createProductImageUploadUrl } from '@/features/admin/products/actions/product-images';
import type { ProductFormValues } from '@/features/admin/products/schemas/product';

type ProductImages = ProductFormValues['images'];
type ProductImage = ProductImages[number];

/**
 * 不論成功失敗，images 都是換過之後的完整清單，順序跟使用者排好的一致：
 * 傳好的那幾張已經是公開網址，失敗的仍留著 File，重試時不用再把傳好的重傳一次。
 */
export type UploadProductImagesResult =
  | { ok: true; images: ProductImages }
  | { ok: false; message: string; images: ProductImages };

// 要放回表單的那一張，message 只有失敗時才有
type UploadedImage = { image: ProductImage; message?: string };

/**
 * 先跟 server action 要一張 presigned URL，再把檔案直接 PUT 到 Neon Object Storage，
 * 換回來的公開網址接著跟其他欄位一起寫進資料庫。
 */
async function uploadProductImage(image: ProductImage): Promise<UploadedImage> {
  // 已經在物件儲存裡的原封不動留著
  if (!image.file) return { image };

  const ticket = await createProductImageUploadUrl({
    fileName: image.file.name,
    contentType: image.file.type,
    size: image.file.size,
  });

  if (!ticket.ok)
    return { image, message: `${image.file.name}：${ticket.message}` };

  // Content-Type 有被簽進網址，這裡必須送一模一樣的值
  const response = await fetch(ticket.uploadUrl, {
    method: 'PUT',
    body: image.file,
    headers: { 'Content-Type': image.file.type },
    // 斷線時讓這一張自己收場，不能把其他張的結果一起帶走
  }).catch(() => null);

  if (!response?.ok)
    return { image, message: `${image.file.name} 上傳失敗，請稍後再試 !` };

  // 預覽的 blob 已經換成公開網址，可以還回去了
  URL.revokeObjectURL(image.url);
  return { image: { url: ticket.url } };
}

/**
 * 挑圖片的當下只在瀏覽器預覽，送出表單時才真的上傳。
 * 存進物件儲存的先後順序不影響任何事（前台的顯示順序由資料庫裡的陣列決定），
 * 所以多張圖片同時傳，等待時間從一張一張相加變成取最慢的那張。
 */
export async function uploadProductImages(
  images: ProductImages,
): Promise<UploadProductImagesResult> {
  // 每一張都自己吞掉錯誤，Promise.all 回來的順序仍是使用者排好的那個
  const uploaded = await Promise.all(
    images.map((image) => uploadProductImage(image)),
  );
  const nextImages = uploaded.map((result) => result.image);
  const messages = uploaded
    .map((result) => result.message)
    .filter((message) => message !== undefined);

  if (messages.length > 0) {
    // 一起失敗的原因多半相同，講清楚第一張，其餘只報張數
    const message =
      messages.length > 1
        ? `${messages[0]}（另有 ${messages.length - 1} 張也失敗）`
        : messages[0];

    return { ok: false, message, images: nextImages };
  }

  return { ok: true, images: nextImages };
}
