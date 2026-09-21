import { imagekitEnv } from '@/env';

/**
 * bucket 裡依用途分資料夾，例如商品圖片放 products、使用者大頭貼放 avatars。
 * ImageKit 後台 External storage 的 origin 指在 bucket 根目錄，
 * 所以資料夾那一層會原封不動出現在公開網址裡。
 */
export type ImageFolder = 'avatars' | 'products' | 'public';

/**
 * ImageKit 在這裡只是擺在前面的 CDN：檔案照舊 PUT 進 Neon Object Storage，
 * ImageKit 讀不到快取時才回源去拿。
 * origin 就是 bucket 根目錄，URL endpoint 接上物件 key（資料夾/檔名）就是公開網址，
 * 存進資料庫的值，例如
 * https://ik.imagekit.io/cyuan/products/spot-tea.jpg
 */
export function imageUrl(folder: ImageFolder, fileName: string) {
  return `${imagekitEnv().urlEndpoint}/${folder}/${fileName}`;
}

/**
 * imageUrl() 的反向：從公開網址換回物件 key，用來刪掉不再被引用的圖片。
 * 只認指定資料夾底下的網址，其餘一律回 null：
 * 刪商品圖片時碰不到大頭貼或其他素材，寧可留著也不要誤刪。
 */
export function objectKeyFromUrl(folder: ImageFolder, url: string) {
  const prefix = `${imagekitEnv().urlEndpoint}/${folder}/`;
  if (!url.startsWith(prefix)) return null;

  const fileName = url.slice(prefix.length);
  // imageUrl() 在資料夾後面只會接一層檔名，再帶路徑分隔的不是我們上傳的那種網址
  if (!fileName || fileName.includes('/')) return null;

  return `${folder}/${fileName}`;
}
