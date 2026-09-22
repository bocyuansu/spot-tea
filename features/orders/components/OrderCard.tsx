import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ShippingPaymentDetails from '@/components/common/ShippingPaymentDetails';
import {
  orderStatusLabels,
  orderStatusVariants,
  paymentStatusLabels,
  paymentStatusVariants,
} from '@/features/orders/order-status';
import type { OrderWithItems } from '@/db/queries/orders';
import { formatDateTW, formatPriceTWD } from '@/lib/format';

type OrderCardProps = {
  order: OrderWithItems;
  // 卡片底部的操作，例如「我的訂單」裡尚未付款訂單的付款按鈕
  action?: ReactNode;
};

export default function OrderCard({ order, action }: OrderCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">訂單編號：{order.orderNumber}</span>
          <span className="text-xs text-muted-foreground">
            下單日期：{formatDateTW(order.createdAt)}
          </span>
        </div>

        <Separator />

        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">訂單狀態</dt>
            <dd>
              <Badge variant={orderStatusVariants[order.status]}>
                {orderStatusLabels[order.status]}
              </Badge>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">付款狀態</dt>
            <dd>
              <Badge variant={paymentStatusVariants[order.paymentStatus]}>
                {paymentStatusLabels[order.paymentStatus]}
              </Badge>
            </dd>
          </div>
        </dl>

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

        <Separator />

        <ShippingPaymentDetails order={order} />

        {action && <div className="flex justify-end">{action}</div>}
      </CardContent>
    </Card>
  );
}
