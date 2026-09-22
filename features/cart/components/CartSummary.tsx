'use client';

import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPriceTWD } from '@/lib/format';
import { useCart } from '@/features/cart/components/CartProvider';
import {
  calculateShippingFee,
  getAmountToFreeShipping,
} from '@/features/orders/shipping';

export default function CartSummary() {
  const { totalQuantity, subtotal, clearCart } = useCart();

  // 結帳頁與建單的 server action 都用同一個函式算運費，三邊不會各算一套
  const shippingFee = calculateShippingFee(subtotal);
  const amountToFreeShipping = getAmountToFreeShipping(subtotal);

  return (
    <Card className="lg:sticky lg:top-28">
      <CardContent className="flex flex-col gap-3">
        <h2 className="font-heading text-lg">訂單摘要</h2>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>商品數量</span>
          <span>{totalQuantity} 件</span>
        </div>
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
          <span className="text-xl font-semibold text-primary">
            {formatPriceTWD(subtotal + shippingFee)}
          </span>
        </div>
        {amountToFreeShipping > 0 && (
          <p className="text-xs text-muted-foreground">
            再買 {formatPriceTWD(amountToFreeShipping)} 就免運
          </p>
        )}

        <Link
          href="/checkout"
          className={buttonVariants({ size: 'lg', className: 'w-full' })}
        >
          前往結帳
        </Link>
        <Button type="button" variant="ghost" size="sm" onClick={clearCart}>
          清空購物車
        </Button>
      </CardContent>
    </Card>
  );
}
