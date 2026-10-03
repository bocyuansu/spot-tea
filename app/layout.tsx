import './globals.css';
import type { Metadata } from 'next';
import { Noto_Serif, Noto_Serif_TC } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toast';
import CartProvider from '@/features/cart/components/CartProvider';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-noto-serif',
});
// Google Fonts 會把中文字型依 unicode-range 切成上百個小檔，瀏覽器只下載頁面用到的字；
// 檔案太多沒辦法 preload
const notoSerifTC = Noto_Serif_TC({
  weight: ['400', '600'],
  variable: '--font-noto-serif-tc',
  preload: false,
});

export const metadata: Metadata = {
  title: {
    template: '%s | 找茶',
    default: '找茶．歡迎來Tea館！',
  },
  description: '從平地到高山，一起探索台灣各地茶區的嚴選好茶',
  manifest: '/manifest.json',
};

// 導覽列與 Footer 交給各 route group 的 layout，這裡只留全站共用的外殼。
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-Hant-TW"
      className={cn('font-serif', notoSerif.variable, notoSerifTC.variable)}
    >
      <body>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
