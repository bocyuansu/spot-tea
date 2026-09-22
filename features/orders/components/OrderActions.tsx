import CancelOrderDialog from '@/features/orders/components/CancelOrderDialog';
import EcpayPayButton from '@/features/payments/components/EcpayPayButton';
import {
  isAwaitingEcpayPayment,
  isCancellable,
} from '@/features/orders/order-status';
import type { OrderWithItems } from '@/db/queries/orders';

type OrderActionsProps = {
  order: OrderWithItems;
};

// 「我的訂單」卡片底部的操作：出貨前可以取消、綠界尚未付款的可以重新付款，都不符合就整列不顯示
export default function OrderActions({ order }: OrderActionsProps) {
  const cancellable = isCancellable(order);
  const awaitingPayment = isAwaitingEcpayPayment(order);

  if (!cancellable && !awaitingPayment) return null;

  return (
    <div className="flex w-full justify-end gap-2">
      {cancellable && (
        <CancelOrderDialog orderId={order.id} orderNumber={order.orderNumber} />
      )}
      {awaitingPayment && (
        <EcpayPayButton orderNumber={order.orderNumber} size="sm" />
      )}
    </div>
  );
}
