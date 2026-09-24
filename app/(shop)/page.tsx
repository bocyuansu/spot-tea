import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import Categories from '@/features/products/components/Categories';
import ProductCard from '@/features/products/components/ProductCard';
import { listCategories, listPublishedProducts } from '@/db/queries/products';

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
      {/* HERO */}
      <section className="grid gap-8 xl:grid-cols-2 xl:items-center">
        <div className="flex flex-col items-center gap-6 text-center xl:items-start xl:text-left">
          <div className="flex flex-col gap-3">
            <p className="text-sm tracking-widest text-muted-foreground">
              找茶．Spot Tea
            </p>
            <h1 className="font-heading text-4xl md:text-6xl">歡迎來Tea館！</h1>
          </div>
          <p className="max-w-md leading-relaxed text-muted-foreground">
            從平地到高山，一起探索台灣各地茶區的嚴選好茶
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/products"
              prefetch={false}
              className={buttonVariants({ size: 'lg' })}
            >
              選購好茶
            </Link>
            <Link
              href="/store-location"
              prefetch={false}
              className={buttonVariants({ size: 'lg', variant: 'outline' })}
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
          className="block rounded-xl"
          priority
        />
      </section>

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
              className="flex shrink-0 items-center text-sm hover:text-primary"
            >
              查看全部
              <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:gap-6">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 品牌理念 */}
      <section className="grid items-center gap-8 rounded-xl bg-primary/10 p-8 md:grid-cols-[10rem_1fr] md:p-12">
        <Image
          src="https://ik.imagekit.io/cyuan/public/spot-tea.jpg"
          alt="Spot Tea logo"
          width={160}
          height={160}
          className="mx-auto block rounded-xl"
        />
        <div className="flex flex-col gap-3 text-center md:text-left">
          <h2 className="font-heading text-2xl md:text-3xl">品牌理念</h2>
          <p className="leading-relaxed text-muted-foreground">
            品牌初衷係以推廣台灣的四大茶區為出發。標誌透過四片葉片來代表台灣四大茶區，運用「探索台灣茶」概念來作為標誌設計，將搜尋的「放大鏡」朝著右上45度仰角，象徵著將台灣茶葉推廣更遠大的理想。
          </p>
        </div>
      </section>
    </div>
  );
}
