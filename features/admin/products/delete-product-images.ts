import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { client, STORAGE_BUCKET } from '@/lib/s3-client';
import { objectKeyFromUrl } from '@/lib/imagekit';

/**
 * 把不再被任何商品引用的圖片從 Neon Object Storage 移除。
 *
 * 上傳是瀏覽器直接 PUT 上去的，刪除則沒有對外的入口：只在 server action 寫完
 * 資料庫之後由這裡發動，所以這個檔案不標 'use server'，不會變成公開的 endpoint。
 *
 * 一次請求最多 1000 個 key，商品圖片遠遠用不到，不另外分批。
 */
export async function deleteProductImages(urls: string[]) {
  const keys = urls.map(objectKeyFromUrl).filter((key) => key !== null);
  if (keys.length === 0) return;

  try {
    await client.send(
      new DeleteObjectsCommand({
        Bucket: STORAGE_BUCKET,
        Delete: { Objects: keys.map((key) => ({ Key: key })) },
      }),
    );
  } catch {
    // 資料庫那邊已經改完了，這裡刪不掉最多是 bucket 留下沒人用的檔案，
    // 不值得讓使用者看到一次其實成功的更新變成失敗
  }
}
