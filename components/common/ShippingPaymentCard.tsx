import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getPaymentMethodLabel,
  paymentMethodDescriptions,
  type PaymentMethod,
} from '@/features/orders/order-status';
import type { order } from '@/db/schema';

type Order = typeof order.$inferSelect;

/**
 * 「收件與付款資訊」卡片，訂單完成頁與後台訂單明細頁共用。
 *
 * 只挑出真正用到的三個欄位，前台的 OrderWithItems 與後台的 AdminOrderDetail
 * 都滿足這個形狀，不必為了共用而把兩邊的型別綁在一起。
 */
type ShippingPaymentCardProps = {
  order: Pick<Order, 'shippingAddress' | 'paymentProvider' | 'note'>;
};

export default function ShippingPaymentCard({ order }: ShippingPaymentCardProps) {
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
