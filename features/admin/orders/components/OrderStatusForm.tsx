'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { orderStatusLabels, paymentStatusLabels } from '@/features/orders/order-status';
import { updateOrderStatus } from '@/features/admin/orders/actions/orders';
import {
  adminOrderStatusSchema,
  type AdminOrderStatusValues,
} from '@/features/admin/orders/schemas/order';
import type { AdminOrderDetail } from '@/db/queries/admin/orders';

type OrderStatusFormProps = {
  order: AdminOrderDetail;
};

export default function OrderStatusForm({ order }: OrderStatusFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(adminOrderStatusSchema),
    defaultValues: {
      status: order.status,
      paymentStatus: order.paymentStatus,
    },
  });

  function onSubmit(values: AdminOrderStatusValues) {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, values);

      if (!result.ok) {
        toast.add({ type: 'error', description: result.message, priority: 'high' });
        return;
      }

      toast.add({ type: 'success', description: '訂單狀態已更新 !' });
      // 明細頁本身就是伺服器渲染的，更新後要再取一次才看得到新狀態
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="[--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle className="text-xl">訂單狀態</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-y-4">
            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>訂單狀態</FieldLabel>
                  <Select
                    items={orderStatusLabels}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? order.status)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(orderStatusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              name="paymentStatus"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>付款狀態</FieldLabel>
                  <Select
                    items={paymentStatusLabels}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? order.paymentStatus)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(paymentStatusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    目前沒有金流串接，收到款項後請在這裡手動改成已付款
                  </FieldDescription>
                </Field>
              )}
            />

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>儲存中</span>
                </>
              ) : (
                <span>儲存變更</span>
              )}
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}
