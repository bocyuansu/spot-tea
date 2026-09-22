import Link from 'next/link';
import { Package } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import OrderCard from '@/features/orders/components/OrderCard';
import CancelOrderDialog from '@/features/orders/components/CancelOrderDialog';
import EcpayPayButton from '@/features/payments/components/EcpayPayButton';
import { isAwaitingEcpayPayment, isCancellable } from '@/features/orders/order-status';
import type { OrderWithItems } from '@/db/queries/orders';

type OrderHistoryProps = {
  orders: OrderWithItems[];
};

export default function OrderHistory({ orders }: OrderHistoryProps) {
  return (
    <section>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Package className="size-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">還沒有任何訂單，挑一款好茶開始吧！</p>
          <Link href="/products" className={buttonVariants({ size: 'lg' })}>
            去逛逛商品
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const cancellable = isCancellable(order);
            const awaitingPayment = isAwaitingEcpayPayment(order);

            return (
              <OrderCard
                key={order.id}
                order={order}
                action={
                  (cancellable || awaitingPayment) && (
                    <>
                      {cancellable && (
                        <CancelOrderDialog orderId={order.id} orderNumber={order.orderNumber} />
                      )}
                      {awaitingPayment && (
                        <EcpayPayButton orderNumber={order.orderNumber} size="sm" />
                      )}
                    </>
                  )
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
