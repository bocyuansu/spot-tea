'use client';

/* UI */
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { Loader2 } from 'lucide-react';
/* React Hook Form */
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cancelOrderSchema, type CancelOrderValues } from '@/features/orders/schemas/cancel-order';
import { cancelOrder } from '@/features/orders/actions/orders';
/* Nextjs */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type CancelOrderDialogProps = {
  orderId: string;
  orderNumber: string;
};

/**
 * 「我的訂單」裡出貨前的訂單卡片上的取消按鈕，按下去先填取消原因再確認。
 * 每張卡片各有一個實例，只服務那一筆訂單。
 */
export default function CancelOrderDialog({ orderId, orderNumber }: CancelOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(cancelOrderSchema),
    defaultValues: { reason: '' },
  });

  // 按返回關掉時清掉沒送出的原因，下次打開是空的
  function handleOpenChange(next: boolean) {
    if (!next) form.reset();
    setOpen(next);
  }

  function onSubmit(values: CancelOrderValues) {
    startTransition(async () => {
      const result = await cancelOrder(orderId, values);

      if (!result.ok) {
        toast.add({ type: 'error', description: result.message, priority: 'high' });
        return;
      }

      setOpen(false);
      toast.add({ type: 'success', description: '訂單已取消 !' });
      // 留在我的訂單，重新取一次伺服器資料才看得到已取消的狀態與原因
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        取消訂單
      </Button>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <AlertDialogHeader>
              <AlertDialogTitle>確定要取消 {orderNumber} 嗎 ?</AlertDialogTitle>
              <AlertDialogDescription>
                取消後無法復原，商品將不會寄出。若已付款，我們會盡快為您辦理退款。
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Controller
              name="reason"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>取消原因</FieldLabel>
                  <Textarea
                    aria-invalid={fieldState.invalid}
                    placeholder="例如：重複下單、想更換商品規格"
                    rows={3}
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>返回</AlertDialogCancel>
              <AlertDialogAction type="submit" variant="destructive" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>處理中</span>
                  </>
                ) : (
                  <span>取消訂單</span>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
