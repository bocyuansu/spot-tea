import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { createAuth } from '@/lib/auth';
import { listUserOrders } from '@/db/queries/orders';
import OrderHistory from '@/features/orders/components/OrderHistory';
import SessionExpiredCard from '@/features/user/components/SessionExpiredCard';

export const metadata: Metadata = {
  title: '我的訂單',
  description: '找茶 訂單紀錄',
};

export default async function UserOrdersPage() {
  const auth = await createAuth();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <SessionExpiredCard />;
  }

  const orders = await listUserOrders(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">我的訂單</h1>
        <p className="mt-1 text-muted-foreground">查看歷史訂單與明細</p>
      </div>

      <OrderHistory orders={orders} />
    </div>
  );
}
