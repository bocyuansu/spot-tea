'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { formatPriceTWD } from '@/lib/format';
import { useCart } from '@/features/cart/components/CartProvider';

export default function CartSummary() {
  const { totalQuantity, subtotal, clearCart } = useCart();

  return (
    <Card className="lg:sticky lg:top-28">
      <CardContent className="flex flex-col gap-3">
        <h2 className="font-heading text-lg">訂單摘要</h2>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>商品數量</span>
          <span>{totalQuantity} 件</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">小計</span>
          <span className="text-xl font-semibold text-primary">{formatPriceTWD(subtotal)}</span>
        </div>
        <p className="text-xs text-muted-foreground">運費將於結帳時計算</p>

        {/* TODO: 接上真正的結帳流程後改這裡 */}
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() =>
            toast.add({
              type: 'info',
              title: '結帳功能開發中',
              description: '付款流程即將上線，敬請期待！',
            })
          }
        >
          前往結帳
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={clearCart}>
          清空購物車
        </Button>
      </CardContent>
    </Card>
  );
}
