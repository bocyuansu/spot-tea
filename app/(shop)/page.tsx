import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, CreditCard, Store, Truck } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import Categories from '@/features/products/components/Categories';
import ProductCard from '@/features/products/components/ProductCard';
import { listCategories, listPublishedProducts } from '@/db/queries/products';
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
} from '@/features/orders/shipping';
import { formatPriceTWD } from '@/lib/format';
import { cn } from '@/lib/utils';

// 格線是 2／4 欄，4 件在每種寬度下都能排滿整列
const LATEST_PRODUCTS_COUNT = 4;

export default async function Home() {
  const [categories, products] = await Promise.all([
    listCategories(),
    listPublishedProducts(''),
  ]);

  // listPublishedProducts 已經依上架時間由新到舊排好
  const latestProducts = products.slice(0, LATEST_PRODUCTS_COUNT);

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-10">
        {/* HERO */}
        <section className="grid gap-8 xl:grid-cols-2 xl:items-center">
          <div className="flex flex-col items-center gap-6 text-center xl:items-start xl:text-left">
            <div className="flex flex-col gap-3">
              <p className="text-sm tracking-widest text-muted-foreground">
                找茶．Spot Tea
              </p>
              <h1 className="font-heading text-4xl md:text-6xl">
                歡迎來Tea館！
              </h1>
            </div>
            <p className="max-w-md leading-relaxed text-balance text-muted-foreground">
              從平地到高山，一起探索台灣各地茶區的嚴選好茶
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/products"
                prefetch={false}
                // 首頁的主要行動，放大到 44px 觸控高度
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'h-11 px-5 text-base',
                )}
              >
                選購好茶
              </Link>
              <Link
                href="/store-location"
                prefetch={false}
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'h-11 px-5 text-base',
                )}
              >
                門市資訊
              </Link>
            </div>
          </div>
          <Image
            src="https://ik.imagekit.io/cyuan/public/alishan-tea-plantation.jpg"
            alt="阿里山的梯田茶園"
            width={800}
            height={480}
            sizes="(min-width: 1280px) 640px, 100vw"
            className="block rounded-xl"
            priority
          />
        </section>

        {/* 購物保障：金額與規則直接讀結帳用的常數，改運費時這裡會跟著變 */}
        <ul className="grid gap-4 border-y py-5 sm:grid-cols-3 sm:gap-0 sm:divide-x">
          <li className="flex items-center gap-3 sm:px-5 sm:first:pl-0">
            <Truck className="size-5 shrink-0 text-primary-strong" />
            <div>
              <p className="text-sm font-medium">
                滿 {formatPriceTWD(FREE_SHIPPING_THRESHOLD)} 免運
              </p>
              <p className="text-xs text-muted-foreground">
                未滿酌收運費 {formatPriceTWD(SHIPPING_FEE)}
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3 sm:px-5">
            <CreditCard className="size-5 shrink-0 text-primary-strong" />
            <div>
              <p className="text-sm font-medium">綠界 ECPay 信用卡付款</p>
              <p className="text-xs text-muted-foreground">
                在綠界頁面刷卡，本站不經手卡號
              </p>
            </div>
          </li>
          <li className="sm:px-5">
            <Link
              href="/store-location"
              prefetch={false}
              className="group flex items-center gap-3"
            >
              <Store className="size-5 shrink-0 text-primary-strong" />
              <div>
                <p className="text-sm font-medium underline-offset-4 group-hover:underline">
                  台中實體門市
                </p>
                <p className="text-xs text-muted-foreground">
                  門市地址與營業時間
                </p>
              </div>
            </Link>
          </li>
        </ul>
      </div>

      {/* 茶區 */}
      {categories.length > 0 && (
        <section className="flex flex-col gap-6">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl">依茶區選購</h2>
            <p className="mt-1 text-muted-foreground">
              每一座山頭，都有自己的風土滋味
            </p>
          </div>
          <Categories categories={categories} products={products} />
        </section>
      )}

      {/* 最新上架 */}
      {latestProducts.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl">最新上架</h2>
              <p className="mt-1 text-muted-foreground">
                剛上架的台灣好茶，搶先品嚐
              </p>
            </div>
            <Link
              href="/products"
              prefetch={false}
              className="flex shrink-0 items-center text-sm hover:text-primary-strong"
            >
              查看全部
              <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:gap-6">
            {latestProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                headingLevel="h3"
              />
            ))}
          </div>
        </section>
      )}

      {/* 品牌理念 */}
      <section className="grid items-center gap-8 rounded-xl bg-primary/10 p-8 md:grid-cols-[10rem_1fr] md:p-12">
        <Image
          src="https://ik.imagekit.io/cyuan/public/spot-tea.jpg"
          alt="找茶品牌標誌"
          width={160}
          height={160}
          className="mx-auto block rounded-xl"
        />
        <div className="flex flex-col gap-3 text-center md:text-left">
          <h2 className="font-heading text-2xl md:text-3xl">品牌理念</h2>
          <p className="leading-relaxed text-pretty text-muted-foreground">
            品牌初衷係以推廣台灣的四大茶區為出發。標誌透過四片葉片來代表台灣四大茶區，運用「探索台灣茶」概念來作為標誌設計，將搜尋的「放大鏡」朝著右上45度仰角，象徵著將台灣茶葉推廣更遠大的理想。
          </p>
        </div>
      </section>
    </div>
  );
}
