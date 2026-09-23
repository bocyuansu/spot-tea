import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type UserAvatarProps = {
  image?: string | null;
  /** 頭像旁邊通常已經有名字，預設當成裝飾；只有頭像單獨代表這個人時才需要給名字 */
  alt?: string;
  className?: string;
  /** 沒有圖片時的底色與圖示顏色，預設是 AvatarFallback 的灰色 */
  fallbackClassName?: string;
  iconClassName?: string;
};

// 這個元件也會在瀏覽器裡跑，讀不到 server 端的 IMAGEKIT_URL_ENDPOINT，只能認網域
const IMAGEKIT_ORIGIN = 'https://ik.imagekit.io/';

/**
 * 請 ImageKit 縮成正方形小圖，不然 Navbar 的 32px 頭像每一頁都要下載整張原圖。
 *
 * - 128：最大的是會員中心的 size-16（64px），給高解析度螢幕抓兩倍
 * - fo-auto：自動找主體再裁切。fo-face 雖然是為頭像設計的，但文件沒說偵測不到臉
 *   （寵物、風景）時會怎麼裁，大頭貼什麼圖都有可能，不冒這個險
 *
 * 不用 next/image：AvatarImage 會先用 new Image() 預載 src，載好才顯示，
 * 換成 next/image 等於預載一次、srcset 挑的那張再下載一次。
 */
function thumbnailUrl(image: string) {
  // 預覽用的 blob: 與外部網址原樣回傳；已經帶查詢字串的可能有 tr 或簽過名，也不動
  if (!image.startsWith(IMAGEKIT_ORIGIN) || image.includes('?')) return image;

  return `${image}?tr=w-128,h-128,fo-auto`;
}

/**
 * 會員頭像：有圖片就顯示圖片，沒有就顯示人像圖示。
 * Navbar、後台側欄與會員中心共用，外觀要改只改這裡。
 */
export default function UserAvatar({
  image,
  alt = '',
  className,
  fallbackClassName,
  iconClassName = 'size-5',
}: UserAvatarProps) {
  return (
    <Avatar className={className}>
      {/* 沒有圖片就不渲染，免得頁面上多一個 src="" 的 <img> */}
      {image && <AvatarImage src={thumbnailUrl(image)} alt={alt} />}
      <AvatarFallback className={fallbackClassName}>
        <User className={iconClassName} />
      </AvatarFallback>
    </Avatar>
  );
}
