'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { HeartOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { setFavorite } from '@/features/favorites/actions/favorites';

type FavoriteRemoveButtonProps = {
  productId: string;
  productName: string;
};

// 收藏頁每張商品卡片底部的「取消收藏」
export default function FavoriteRemoveButton({
  productId,
  productName,
}: FavoriteRemoveButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const result = await setFavorite(productId, false);

      if (!result.ok) {
        toast.add({
          type: 'error',
          description: result.message,
          priority: 'high',
        });
        return;
      }

      toast.add({ type: 'success', description: '已取消收藏 !' });
      // 留在收藏頁，重新取一次伺服器資料，這張卡片才會從清單消失
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={`取消收藏 ${productName}`}
      disabled={isPending}
      onClick={handleClick}
      className="w-full"
    >
      <HeartOff />
      取消收藏
    </Button>
  );
}
