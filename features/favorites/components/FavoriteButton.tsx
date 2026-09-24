'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { setFavorite } from '@/features/favorites/actions/favorites';

type FavoriteButtonProps = {
  productId: string;
  productSlug: string;
  isLoggedIn: boolean;
  // 由商品頁在伺服器端查好，第一次渲染就是正確狀態，不會閃一下
  initialFavorited: boolean;
};

// 商品頁「加入購物車」下方的收藏按鈕，再按一次就取消收藏
export default function FavoriteButton({
  productId,
  productSlug,
  isLoggedIn,
  initialFavorited,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  // 訪客先去登入，登入完由 next 帶回這個商品頁
  if (!isLoggedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/products/${productSlug}`)}`}
        prefetch={false}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'lg' }),
          'w-full gap-2',
        )}
      >
        <Heart className="size-4" />
        加入收藏
      </Link>
    );
  }

  function handleClick() {
    const next = !favorited;

    startTransition(async () => {
      const result = await setFavorite(productId, next);

      if (!result.ok) {
        toast.add({
          type: 'error',
          description: result.message,
          priority: 'high',
        });
        return;
      }

      setFavorited(next);
      toast.add({
        type: 'success',
        description: next ? '已加入收藏 !' : '已取消收藏 !',
      });
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      aria-pressed={favorited}
      disabled={isPending}
      onClick={handleClick}
      className="w-full gap-2"
    >
      <Heart
        className={cn('size-4', favorited && 'fill-red-500 text-red-500')}
      />
      {favorited ? '已收藏' : '加入收藏'}
    </Button>
  );
}
