import {
  getPaymentMethodLabel,
  paymentMethodDescriptions,
  type PaymentMethod,
} from '@/features/orders/order-status';
import type { order } from '@/db/schema';

type Order = typeof order.$inferSelect;

/**
 * 收件人、收件地址、付款方式與訂單備註。前台的訂單卡片把它併在訂單裡，
 * 後台訂單明細頁則包成獨立的「收件與付款資訊」卡片，外框由各自決定。
 *
 * 只挑出真正用到的三個欄位，前台的 OrderWithItems 與後台的 AdminOrderDetail
 * 都滿足這個形狀，不必為了共用而把兩邊的型別綁在一起。
 */
type ShippingPaymentDetailsProps = {
  order: Pick<Order, 'shippingAddress' | 'paymentProvider' | 'note'>;
};

export default function ShippingPaymentDetails({ order }: ShippingPaymentDetailsProps) {
  const { recipientName, phone, postalCode, city, district, addressLine } = order.shippingAddress;
  // 舊資料的 paymentProvider 可能不在清單裡，查不到說明就不顯示那一行
  const paymentDescription = paymentMethodDescriptions[order.paymentProvider as PaymentMethod];

  return (
    <dl className="flex flex-col gap-3 text-sm">
      <div className="flex flex-col gap-1">
        <dt className="text-xs text-muted-foreground">收件人</dt>
        <dd>
          {recipientName}　{phone}
        </dd>
      </div>

      <div className="flex flex-col gap-1">
        <dt className="text-xs text-muted-foreground">收件地址</dt>
        <dd>
          {postalCode} {city}
          {district}
          {addressLine}
        </dd>
      </div>

      <div className="flex flex-col gap-1">
        <dt className="text-xs text-muted-foreground">付款方式</dt>
        <dd>{getPaymentMethodLabel(order.paymentProvider)}</dd>
        {paymentDescription && (
          <dd className="text-xs text-muted-foreground">{paymentDescription}</dd>
        )}
      </div>

      {order.note && (
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">訂單備註</dt>
          <dd className="whitespace-pre-wrap">{order.note}</dd>
        </div>
      )}
    </dl>
  );
}
