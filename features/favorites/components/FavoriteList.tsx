import Link from 'next/link';
import { Heart } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import ProductCard from '@/features/products/components/ProductCard';
import FavoriteRemoveButton from '@/features/favorites/components/FavoriteRemoveButton';
import type { FavoriteWithProduct } from '@/db/queries/favorites';

type FavoriteListProps = {
  favorites: FavoriteWithProduct[];
};

export default function FavoriteList({ favorites }: FavoriteListProps) {
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <Heart className="size-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          還沒有收藏任何商品，逛逛看有沒有喜歡的茶吧！
        </p>
        <Link href="/products" className={buttonVariants({ size: 'lg' })}>
          去逛逛商品
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {favorites.map(({ product }) => (
        <ProductCard
          key={product.id}
          product={product}
          action={
            <FavoriteRemoveButton
              productId={product.id}
              productName={product.name}
            />
          }
        />
      ))}
    </div>
  );
}
