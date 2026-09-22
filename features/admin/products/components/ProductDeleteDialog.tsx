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
import { deleteProduct } from '@/features/admin/products/actions/products';

type ProductDeleteDialogProps = {
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ProductDeleteDialog({
  productId,
  productName,
  open,
  onOpenChange,
}: ProductDeleteDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteProduct(productId);

      if (!result.ok) {
        toast.add({
          type: 'error',
          description: result.message,
          priority: 'high',
        });
        return;
      }

      onOpenChange(false);
      toast.add({ type: 'success', description: '商品已刪除 !' });
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確定要刪除「{productName}」嗎 ?</AlertDialogTitle>
          <AlertDialogDescription>
            這個商品底下的所有規格也會一併刪除，而且無法復原。已成立的訂單不受影響。
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
