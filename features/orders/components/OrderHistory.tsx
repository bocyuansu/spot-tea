import Link from 'next/link';
import { Package } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import OrderCard from '@/features/orders/components/OrderCard';
import type { OrderWithItems } from '@/db/queries/orders';

type OrderHistoryProps = {
  orders: OrderWithItems[];
};

export default function OrderHistory({ orders }: OrderHistoryProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-2xl">訂單紀錄</h2>

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
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}
