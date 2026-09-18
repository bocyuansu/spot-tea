import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { orderStatusLabels, paymentStatusLabels } from '@/features/orders/order-status';
import type { OrderWithItems } from '@/db/queries/orders';
import { formatDateTW, formatPriceTWD } from '@/lib/format';

type OrderCardProps = {
  order: OrderWithItems;
};

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">訂單編號：{order.orderNumber}</span>
            <span className="text-xs text-muted-foreground">
              下單日期：{formatDateTW(order.createdAt)}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {orderStatusLabels[order.status]}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {paymentStatusLabels[order.paymentStatus]}
            </span>
          </div>
        </div>

        <Separator />

        <ul className="flex flex-col gap-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <div className="flex min-w-0 flex-col">
                <span className="truncate">{item.productName}</span>
                <span className="text-xs text-muted-foreground">
                  規格：{item.variantName}　數量：{item.quantity}
                </span>
              </div>
              <span className="shrink-0">{formatPriceTWD(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            小計 {formatPriceTWD(order.subtotalAmount)}　運費 {formatPriceTWD(order.shippingFee)}
          </span>
          <span className="font-semibold text-primary">{formatPriceTWD(order.totalAmount)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
