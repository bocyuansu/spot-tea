import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getPaymentMethodLabel,
  paymentMethodDescriptions,
  type PaymentMethod,
} from '@/features/orders/order-status';
import type { OrderWithItems } from '@/db/queries/orders';

type OrderShippingInfoProps = {
  order: OrderWithItems;
};

export default function OrderShippingInfo({ order }: OrderShippingInfoProps) {
  const { recipientName, phone, postalCode, city, district, addressLine } = order.shippingAddress;
  // seed 資料的 paymentProvider 是 'ecpay'，查不到說明就不顯示那一行
  const paymentDescription = paymentMethodDescriptions[order.paymentProvider as PaymentMethod];

  return (
    <Card>
      <CardHeader>
        <CardTitle>收件與付款資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">收件人</span>
          <span>
            {recipientName}　{phone}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">收件地址</span>
          <span>
            {postalCode} {city}
            {district}
            {addressLine}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">付款方式</span>
          <span>{getPaymentMethodLabel(order.paymentProvider)}</span>
          {paymentDescription && (
            <span className="text-xs text-muted-foreground">{paymentDescription}</span>
          )}
        </div>

        {order.note && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">訂單備註</span>
            <span className="whitespace-pre-wrap">{order.note}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
