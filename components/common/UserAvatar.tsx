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
      {image && <AvatarImage src={image} alt={alt} />}
      <AvatarFallback className={fallbackClassName}>
        <User className={iconClassName} />
      </AvatarFallback>
    </Avatar>
  );
}
