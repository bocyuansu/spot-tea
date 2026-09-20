import { createProductImageUploadUrl } from '@/features/admin/products/actions/product-images';
import type { ProductFormValues } from '@/features/admin/products/schemas/product';

type ProductImages = ProductFormValues['images'];

/**
 * 不論成功失敗，images 都是換過之後的完整清單：傳好的那幾張已經是公開網址，
 * 失敗的那張和它後面的仍留著 File，重試時不用再把傳好的重傳一次。
 */
export type UploadProductImagesResult =
  | { ok: true; images: ProductImages }
  | { ok: false; message: string; images: ProductImages };

/**
 * 挑圖片的當下只在瀏覽器預覽，送出表單時才真的上傳：
 * 先跟 server action 要一張 presigned URL，再把檔案直接 PUT 到 Neon Object Storage，
 * 換回來的公開網址接著跟其他欄位一起寫進資料庫。
 */
export async function uploadProductImages(
  images: ProductImages,
): Promise<UploadProductImagesResult> {
  const uploaded: ProductImages = [];

  // 一張一張傳，順序要跟使用者排好的一致
  for (const [index, image] of images.entries()) {
    if (!image.file) {
      uploaded.push(image);
      continue;
    }

    // 這張以後的都還沒傳，原封不動接在已經傳好的後面
    const untouched = images.slice(index);

    const ticket = await createProductImageUploadUrl({
      fileName: image.file.name,
      contentType: image.file.type,
      size: image.file.size,
    });

    if (!ticket.ok) {
      return {
        ok: false,
        message: `${image.file.name}：${ticket.message}`,
        images: [...uploaded, ...untouched],
      };
    }

    // Content-Type 有被簽進網址，這裡必須送一模一樣的值
    const response = await fetch(ticket.uploadUrl, {
      method: 'PUT',
      body: image.file,
      headers: { 'Content-Type': image.file.type },
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `${image.file.name} 上傳失敗，請稍後再試 !`,
        images: [...uploaded, ...untouched],
      };
    }

    // 預覽的 blob 已經換成公開網址，可以還回去了
    URL.revokeObjectURL(image.url);
    uploaded.push({ url: ticket.url });
  }

  return { ok: true, images: uploaded };
}
