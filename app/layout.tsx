import './globals.css';
import type { Metadata } from 'next';
import { Noto_Serif } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toast';
import CartProvider from '@/features/cart/components/CartProvider';

const notoSerif = Noto_Serif({ subsets: ['latin'], variable: '--font-serif' });

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
    <html lang="zh-Hant-TW" className={cn('font-serif', notoSerif.variable)}>
      <body>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
