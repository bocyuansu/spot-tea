import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatPriceTWD } from '@/lib/format';
import type { ProductWithDetails } from '@/db/queries/products';

type ProductCardProps = {
  product: ProductWithDetails;
  // 卡片底部的操作列，例如收藏頁的「取消收藏」；商品列表不傳就沒有
  action?: ReactNode;
  // 首頁的卡片在區塊 <h2> 底下，要降一級
  headingLevel?: 'h2' | 'h3';
};

export default function ProductCard({
  product,
  action,
  headingLevel: Heading = 'h2',
}: ProductCardProps) {
  const image = product.images?.[0] ?? null;
  const prices = product.variants.map((variant) => variant.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
  const inStock = product.variants.some((variant) => variant.stock > 0);

  const href = `/products/${product.slug}`;

  return (
    <Card className="relative gap-3 overflow-hidden pt-0">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            width={600}
            height={600}
            // 格線最少 2 欄、最多 4 欄，xl 的容器上限 1280px 時一欄約 300px
            sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="block object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/card:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
            <Leaf className="size-10" />
          </div>
        )}
        {!inStock && (
          // 遮罩不吃點擊，售完的商品仍然點得進商品頁
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70">
            <span className="rounded-full bg-foreground px-3 py-1 text-xs text-background">
              已售完
            </span>
          </div>
        )}
      </div>
      <CardContent className="flex flex-col gap-1">
        {product.category && (
          <span className="text-xs text-muted-foreground">
            種類：{product.category.name}
          </span>
        )}
        {product.origin && (
          <p className="text-xs text-muted-foreground">
            產地：{product.origin}
          </p>
        )}
        <Heading className="font-heading text-base leading-snug font-medium">
          {/* 連結用 ::after 撐滿整張卡片：圖片、名稱、價格都點得到，螢幕閱讀器只會讀到商品名稱一次 */}
          <Link
            href={href}
            prefetch={false}
            className="underline-offset-4 outline-none group-hover/card:underline after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
          >
            {product.name}
          </Link>
        </Heading>
        <p className="mt-1 text-sm font-semibold text-primary-strong">
          {minPrice === null
            ? '價格洽詢'
            : minPrice === maxPrice
              ? formatPriceTWD(minPrice)
              : `${formatPriceTWD(minPrice)} 起`}
        </p>
      </CardContent>
      {/* 疊在撐滿卡片的連結上面，操作按鈕才按得到 */}
      {action && (
        <CardFooter className="relative z-10 p-1">{action}</CardFooter>
      )}
    </Card>
  );
}
