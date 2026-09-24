'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import type { AdminProduct } from '@/db/queries/admin/products';
import { updateProductsStatus } from '@/features/admin/products/actions/products';
import ProductDeleteDialog from '@/features/admin/products/components/ProductDeleteDialog';
import type { ProductBatchStatus } from '@/features/admin/products/schemas/product';

const batchStatusLabels: Record<ProductBatchStatus, string> = {
  published: '上架',
  archived: '下架',
};

type ProductBatchActionsProps = {
  // 刪除確認對話框要列出名稱，所以不只帶 id
  products: Pick<AdminProduct, 'id' | 'name'>[];
  // 操作成功後清掉勾選，免得下一次批次操作又帶到同一批商品
  onSuccess: () => void;
};

export default function ProductBatchActions({
  products,
  onSuccess,
}: ProductBatchActionsProps) {
  const [isPending, startTransition] = useTransition();
  // 只有按下去的那顆按鈕要轉圈
  const [pendingStatus, setPendingStatus] = useState<ProductBatchStatus>();
  const router = useRouter();

  function changeStatus(status: ProductBatchStatus) {
    setPendingStatus(status);

    startTransition(async () => {
      const result = await updateProductsStatus(
        products.map((product) => product.id),
        status,
      );

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
        description: `已${batchStatusLabels[status]} ${products.length} 項商品 !`,
      });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">
        {products.length > 0 && `已選取 ${products.length} 項商品`}
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={products.length === 0 || isPending}
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
          disabled={products.length === 0 || isPending}
          onClick={() => changeStatus('archived')}
        >
          {isPending && pendingStatus === 'archived' ? (
            <Loader2 className="animate-spin" />
          ) : (
            <EyeOff />
          )}
          <span>下架</span>
        </Button>
        <ProductDeleteDialog
          products={products}
          disabled={products.length === 0 || isPending}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
