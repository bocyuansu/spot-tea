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
};

export default function ProductCard({ product, action }: ProductCardProps) {
  const image = product.images?.[0] ?? null;
  const prices = product.variants.map((variant) => variant.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
  const inStock = product.variants.some((variant) => variant.stock > 0);

  return (
    <Card className="gap-3 overflow-hidden pt-0">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {image ? (
          <Link
            href={`/products/${product.slug}`}
            prefetch={false}
            className="block"
          >
            <Image
              src={image}
              alt={product.name}
              width={600}
              height={600}
              className="block object-cover hover:scale-105 transition-all duration-300"
            />
          </Link>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
            <Leaf className="size-10" />
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
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
        <h2 className="font-heading text-base leading-snug font-medium">
          {product.name}
        </h2>
        <p className="mt-1 text-sm font-semibold text-primary">
          {minPrice === null
            ? '價格洽詢'
            : minPrice === maxPrice
              ? formatPriceTWD(minPrice)
              : `${formatPriceTWD(minPrice)} 起`}
        </p>
      </CardContent>
      {action && <CardFooter className="p-1">{action}</CardFooter>}
    </Card>
  );
}
