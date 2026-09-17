import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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
  description:
    '品牌初衷係以推廣台灣的四大茶區為出發。標誌透過四片葉片來代表台灣四大茶區，運用「探索台灣茶」概念來作為標誌設計，將搜尋的「放大鏡」朝著右上45度仰角，象徵著將台灣茶葉推廣更遠大的理想。',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant-TW" className={cn('font-serif', notoSerif.variable)}>
      <body>
        <CartProvider>
          <Navbar />
          <main className="mx-auto p-4 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-7xl">
            {children}
          </main>
          <Footer />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
