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
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/toast';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCategory } from '@/features/admin/categories/actions/categories';

type CategoryDeleteDialogProps = {
  categoryId: string;
  categoryName: string;
  // 用來提醒會有幾項商品變成未分類
  productCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CategoryDeleteDialog({
  categoryId,
  categoryName,
  productCount,
  open,
  onOpenChange,
}: CategoryDeleteDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteCategory(categoryId);

      if (!result.ok) {
        toast.add({
          type: 'error',
          description: result.message,
          priority: 'high',
        });
        return;
      }

      onOpenChange(false);
      toast.add({ type: 'success', description: '分類已刪除 !' });
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確定要刪除「{categoryName}」嗎 ?</AlertDialogTitle>
          <AlertDialogDescription>
            {productCount > 0
              ? `底下的 ${productCount} 項商品會變成未分類，商品本身不會被刪除。`
              : '這個分類底下還沒有商品，刪除後無法復原。'}
          </AlertDialogDescription>
        </AlertDialogHeader>
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
