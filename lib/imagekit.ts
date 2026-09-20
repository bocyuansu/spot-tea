import { imagekitEnv } from '@/env';

/**
 * ImageKit 後台把 external storage 的 origin 指到 bucket 的這個資料夾，
 * 所以上傳一定要放進來，ImageKit 才回源拿得到。
 */
const IMAGE_FOLDER = 'products';

/** 檔名對應到 Neon Object Storage 裡的物件 key */
export function objectKey(fileName: string) {
  return `${IMAGE_FOLDER}/${fileName}`;
}

/**
 * ImageKit 在這裡只是擺在前面的 CDN：檔案照舊 PUT 進 Neon Object Storage，
 * ImageKit 讀不到快取時才回源去拿。
 *
 * origin 已經指在 IMAGE_FOLDER 上，網址裡不會再出現那一層，
 * 所以 URL endpoint 直接接檔名就是公開網址，例如
 * https://ik.imagekit.io/cyuan/spot-tea.jpg ，這也是存進資料庫的值。
 */
export function imageUrl(fileName: string) {
  return `${imagekitEnv().urlEndpoint}/${fileName}`;
}
