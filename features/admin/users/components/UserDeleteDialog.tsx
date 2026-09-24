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
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/auth-errors';
import { useUserDialog } from '@/features/admin/users/components/UserActionsProvider';
import { userTablePaginationAtom } from '@/features/admin/users/user-table-state';

export default function UserDeleteDialog() {
  const { user, open, onOpenChange } = useUserDialog('delete');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onConfirm() {
    startTransition(async () => {
      const { error } = await authClient.admin.removeUser({ userId: user.id });

      if (error) {
        toast.add({
          type: 'error',
          description: getErrorMessage(error.code ?? '', 'zh'),
          priority: 'high',
        });
        return;
      }

      onOpenChange(false);
      toast.add({ type: 'success', description: '會員已刪除 !' });
      // 刪掉的可能是最後一頁僅剩的一位，回到第一頁才不會停在空白頁
      userTablePaginationAtom.set((old) => ({ ...old, pageIndex: 0 }));
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確定要刪除「{user.name}」嗎 ?</AlertDialogTitle>
          <AlertDialogDescription>
            會員的登入紀錄會一起刪除，而且無法復原。如果只是想暫時停用，請改用停權。
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
