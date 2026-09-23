import type { Area } from 'react-easy-crop';

// 頭像最大只顯示到幾十 px，存 512 已經綽綽有餘，也讓檔案遠低於上傳上限
const outputSize = 512;

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.src = source;
  });
}

/**
 * 依 react-easy-crop 給的像素範圍，把原圖裁成正方形並縮到 outputSize 以內。
 * 一律輸出 JPEG：每個瀏覽器都編得出來，而且在 avatarContentTypes 允許的清單裡。
 */
export async function cropAvatar(
  source: string,
  area: Area,
): Promise<Blob | null> {
  const image = await loadImage(source);
  const size = Math.min(area.width, outputSize);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) return null;

  // JPEG 沒有透明度，先鋪白底，不然去背的 PNG 會變成黑底
  context.fillStyle = '#fff';
  context.fillRect(0, 0, size, size);
  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    size,
    size,
  );

  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.9);
  });
}
