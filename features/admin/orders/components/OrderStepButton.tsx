'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import type { ActionResult } from '@/features/admin/shared/action-result';

type OrderStepButtonProps = {
  label: string;
  // 標記已付款、取消訂單、標記退款這類收不回來的步驟會先跳確認框；
  // 其中會讓訂單走不下去的（取消、退款）再加上 destructive 樣式
  confirm?: { title: string; description: string; destructive?: boolean };
  disabled?: boolean;
  onRun: () => Promise<ActionResult>;
};

export default function OrderStepButton({
  label,
  confirm,
  disabled = false,
  onRun,
}: OrderStepButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function run() {
    startTransition(async () => {
      const result = await onRun();

      if (!result.ok) {
        toast.add({
          type: 'error',
          description: result.message,
          priority: 'high',
        });
        return;
      }

      setOpen(false);
      toast.add({ type: 'success', description: `已${label} !` });
      // 留在明細頁，重新取一次伺服器資料才看得到新狀態與下一步的按鈕
      router.refresh();
    });
  }

  const content = (
    <>
      {isPending && <Loader2 className="size-4 animate-spin" />}
      <span>{label}</span>
    </>
  );

  if (!confirm) {
    return (
      <Button disabled={disabled || isPending} onClick={run}>
        {content}
      </Button>
    );
  }

  const variant = confirm.destructive ? 'destructive' : 'default';

  return (
    <>
      <Button
        variant={variant}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>返回</AlertDialogCancel>
            <AlertDialogAction
              variant={variant}
              disabled={isPending}
              onClick={run}
            >
              {content}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
