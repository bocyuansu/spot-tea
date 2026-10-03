'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPriceTWD } from '@/lib/format';
import type { CartItem } from '@/features/cart/schemas/cart';

type CheckoutSummaryProps = {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  isPending: boolean;
};

export default function CheckoutSummary({
  items,
  subtotal,
  shippingFee,
  totalAmount,
  isPending,
}: CheckoutSummaryProps) {
  return (
    <Card className="lg:sticky lg:top-28">
      <CardContent className="flex flex-col gap-3">
        <h2 className="font-heading text-lg">訂單明細</h2>

        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.variantId}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate">{item.productName}</span>
                <span className="text-xs text-muted-foreground">
                  規格：{item.variantLabel}　數量：{item.quantity}
                </span>
              </div>
              <span className="shrink-0">
                {formatPriceTWD(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>小計</span>
          <span>{formatPriceTWD(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>運費</span>
          <span>
            {shippingFee === 0 ? '免運' : formatPriceTWD(shippingFee)}
          </span>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">合計</span>
          <span className="text-xl font-semibold text-primary-strong">
            {formatPriceTWD(totalAmount)}
          </span>
        </div>

        <Button
          type="submit"
          size="lg"
          // 購買流程的主要按鈕撐到 44px 觸控高度
          className="h-11 w-full text-base"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>送出訂單中</span>
            </>
          ) : (
            <span>送出訂單</span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
