import {
  getPaymentMethodLabel,
  orderStatusLabels,
  orderStatusVariants,
  paymentMethodDescriptions,
  paymentStatusLabels,
  paymentStatusVariants,
  type PaymentMethod,
} from '@/features/orders/order-status';
import type { order } from '@/db/schema';
import { Badge } from '../ui/badge';
import { OrderWithItems } from '@/db/queries/orders';
import { formatDateTW } from '@/lib/format';

type ShippingPaymentDetailsProps = {
  order: OrderWithItems;
};

export default function ShippingPaymentDetails({ order }: ShippingPaymentDetailsProps) {
  const { createdAt } = order;
  const { recipientName, phone, postalCode, city, district, addressLine } = order.shippingAddress;
  // 舊資料的 paymentProvider 可能不在清單裡，查不到說明就不顯示那一行
  const paymentDescription = paymentMethodDescriptions[order.paymentProvider as PaymentMethod];

  return (
    <div className="w-full flex justify-between">
      {/* LEFT */}
      <dl className="flex-1 flex flex-col gap-3 text-sm">
        <div className="flex">
          <dt className="font-medium">訂單日期：</dt>
          <dd>{formatDateTW(createdAt)}</dd>
        </div>

        <div className="flex">
          <dt className="font-medium">收件人：</dt>
          <dd>{recipientName}</dd>
        </div>

        <div className="flex">
          <dt className="font-medium">手機號碼：</dt>
          <dd>{phone}</dd>
        </div>

        <div>
          <div className="flex">
            <dt className="font-medium">付款方式：</dt>
            <dd>{getPaymentMethodLabel(order.paymentProvider)}</dd>
          </div>
          {paymentDescription && <dd>{paymentDescription}</dd>}
        </div>

        <div>
          <dt className="font-medium">收件地址</dt>
          <dd>
            {postalCode} {city}
            {district}
            {addressLine}
          </dd>
        </div>

        {order.note && (
          <div className="flex flex-col">
            <dt className="font-medium">訂單備註</dt>
            <dd className="whitespace-pre-wrap">{order.note}</dd>
          </div>
        )}
      </dl>

      {/* Right */}
      <dl className="flex flex-col text-sm">
        <div className="flex gap-2 items-center">
          <dt className="font-medium py-2">訂單狀態</dt>
          <dd>
            <Badge variant={orderStatusVariants[order.status]}>
              {orderStatusLabels[order.status]}
            </Badge>
          </dd>
        </div>
        <div className="flex gap-2 items-center">
          <dt className="font-medium py-2">付款狀態</dt>
          <dd>
            <Badge variant={paymentStatusVariants[order.paymentStatus]}>
              {paymentStatusLabels[order.paymentStatus]}
            </Badge>
          </dd>
        </div>
      </dl>
    </div>
  );
}
