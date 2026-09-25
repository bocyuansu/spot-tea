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
import type { AdminCategoryWithCount } from '@/db/queries/admin/categories';
import { deleteCategories } from '@/features/admin/categories/actions/categories';
import { categoryTableState } from '@/features/admin/categories/category-table-state';

type CategoryDeleteDialogProps = {
  // products 與 productCount 用來提醒哪些商品會變成未分類
  categories: Pick<
    AdminCategoryWithCount,
    'id' | 'name' | 'products' | 'productCount'
  >[];
  // 刪除成功後清掉勾選
  onSuccess: () => void;
};

// 分類列表的批次刪除：按鈕放在列表上方，按下去先開對話框確認
export default function CategoryDeleteDialog({
  categories,
  onSuccess,
}: CategoryDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  // 打開時記下這一批分類：刪除成功會清掉勾選，關閉動畫期間的標題和清單才不會跟著變成 0 個
  const [targets, setTargets] = useState(categories);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const productCount = targets.reduce(
    (total, category) => total + category.productCount,
    0,
  );

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) setTargets(categories);
    setOpen(isOpen);
  }

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteCategories(
        targets.map((category) => category.id),
      );

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
        description: `已刪除 ${targets.length} 個分類 !`,
      });
      // 刪掉的可能是後面幾頁的全部分類，回到第一頁才不會停在空白頁
      categoryTableState.firstPage();
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          <Button
            variant="destructive"
            size="sm"
            disabled={categories.length === 0}
          />
        }
      >
        <Trash2 />
        <span>刪除</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            確定要刪除選取的 {targets.length} 個分類嗎 ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {productCount > 0
              ? `底下共 ${productCount} 項商品會變成未分類，商品本身不會被刪除。`
              : '這些分類底下還沒有商品，刪除後無法復原。'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {/* 換頁或搜尋後勾選仍會保留，列出名稱才看得到不在畫面上的分類；
            每個分類底下列出會變成未分類的商品 */}
        <ul className="flex max-h-60 flex-col gap-2 overflow-y-auto rounded-lg border px-3 py-2 text-sm">
          {targets.map((category) => (
            <li key={category.id}>
              <p className="truncate font-medium">{category.name}</p>
              {category.products.length > 0 ? (
                <ul className="pl-4 text-muted-foreground">
                  {category.products.map((product) => (
                    <li key={product.id} className="truncate">
                      {product.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pl-4 text-muted-foreground">沒有商品</p>
              )}
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
