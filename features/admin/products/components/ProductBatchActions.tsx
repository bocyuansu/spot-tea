'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { updateProductsStatus } from '@/features/admin/products/actions/products';
import type { ProductBatchStatus } from '@/features/admin/products/schemas/product';

const batchStatusLabels: Record<ProductBatchStatus, string> = {
  published: '上架',
  archived: '下架',
};

type ProductBatchActionsProps = {
  productIds: string[];
  // 更新成功後清掉勾選，免得下一次批次操作又帶到同一批商品
  onSuccess: () => void;
};

export default function ProductBatchActions({
  productIds,
  onSuccess,
}: ProductBatchActionsProps) {
  const [isPending, startTransition] = useTransition();
  // 只有按下去的那顆按鈕要轉圈
  const [pendingStatus, setPendingStatus] = useState<ProductBatchStatus>();
  const router = useRouter();

  function changeStatus(status: ProductBatchStatus) {
    setPendingStatus(status);

    startTransition(async () => {
      const result = await updateProductsStatus(productIds, status);

      if (!result.ok) {
        toast.add({
          type: 'error',
          description: result.message,
          priority: 'high',
        });
        return;
      }

      onSuccess();
      toast.add({
        type: 'success',
        description: `已${batchStatusLabels[status]} ${productIds.length} 項商品 !`,
      });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">
        {productIds.length > 0
          ? `已選取 ${productIds.length} 項商品`
          : '勾選商品後可以批次上下架'}
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={productIds.length === 0 || isPending}
          onClick={() => changeStatus('published')}
        >
          {isPending && pendingStatus === 'published' ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Eye />
          )}
          <span>上架</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={productIds.length === 0 || isPending}
          onClick={() => changeStatus('archived')}
        >
          {isPending && pendingStatus === 'archived' ? (
            <Loader2 className="animate-spin" />
          ) : (
            <EyeOff />
          )}
          <span>下架</span>
        </Button>
      </div>
    </div>
  );
}
