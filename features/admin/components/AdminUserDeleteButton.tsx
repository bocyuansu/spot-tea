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
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/auth-errors';

type AdminUserDeleteButtonProps = {
  userId: string;
  userName: string;
  // 有訂單的會員刪不掉（order.userId 是財務紀錄，沒設 onDelete），自己也不能刪自己
  disabledReason?: string;
};

export default function AdminUserDeleteButton({
  userId,
  userName,
  disabledReason,
}: AdminUserDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (disabledReason) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        aria-label={disabledReason}
        title={disabledReason}
      >
        <Trash2 className="size-4" />
      </Button>
    );
  }

  function onConfirm() {
    startTransition(async () => {
      const { error } = await authClient.admin.removeUser({ userId });

      if (error) {
        toast.add({
          type: 'error',
          description: getErrorMessage(error.code ?? '', 'zh'),
          priority: 'high',
        });
        return;
      }

      setOpen(false);
      toast.add({ type: 'success', description: '會員已刪除 !' });
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant="ghost" size="icon" aria-label={`刪除 ${userName}`} />}
      >
        <Trash2 className="size-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確定要刪除「{userName}」嗎 ?</AlertDialogTitle>
          <AlertDialogDescription>
            這位會員的購物車與登入紀錄會一併刪除，而且無法復原。如果只是想暫時停用，請改用停權。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>取消</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isPending} onClick={onConfirm}>
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
