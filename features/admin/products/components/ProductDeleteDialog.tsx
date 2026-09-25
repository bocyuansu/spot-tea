'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { Loader2, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminProduct } from '@/db/queries/admin/products';
import { deleteProducts } from '@/features/admin/products/actions/products';
import { productTableState } from '@/features/admin/products/product-table-state';

type ProductDeleteDialogProps = {
  products: Pick<AdminProduct, 'id' | 'name'>[];
  disabled: boolean;
  // 刪除成功後清掉勾選
  onSuccess: () => void;
};

// 商品列表的批次刪除：按鈕和上下架放在同一排，按下去先開對話框確認
export default function ProductDeleteDialog({
  products,
  disabled,
  onSuccess,
}: ProductDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  // 打開時記下這一批商品：刪除成功會清掉勾選，關閉動畫期間的標題和清單才不會跟著變成 0 項
  const [targets, setTargets] = useState(products);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) setTargets(products);
    setOpen(isOpen);
  }

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteProducts(targets.map((product) => product.id));

      if (!result.ok) {
        toast.add({
          type: 'error',
          description: result.message,
          priority: 'high',
        });
        return;
      }

      setOpen(false);
      onSuccess();
      toast.add({
        type: 'success',
        description: `已刪除 ${targets.length} 項商品 !`,
      });
      // 刪掉的可能是後面幾頁的全部商品，回到第一頁才不會停在空白頁
      productTableState.firstPage();
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={<Button variant="destructive" size="sm" disabled={disabled} />}
      >
        <Trash2 />
        <span>刪除</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            確定要刪除選取的 {targets.length} 項商品嗎 ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            這些商品底下的所有規格也會一併刪除，而且無法復原。已成立的訂單不受影響。
          </AlertDialogDescription>
        </AlertDialogHeader>
        {/* 換頁或搜尋後勾選仍會保留，列出名稱才看得到不在畫面上的商品 */}
        <ul className="max-h-40 overflow-y-auto rounded-lg border px-3 py-2 text-sm">
          {targets.map((product) => (
            <li key={product.id} className="truncate">
              {product.name}
            </li>
          ))}
        </ul>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>取消</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>刪除中</span>
              </>
            ) : (
              <span>刪除</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
