import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminOrderById } from '@/db/queries/admin/orders';
import OrderDetail from '@/features/admin/orders/components/OrderDetail';
import OrderStatusActions from '@/features/admin/orders/components/OrderStatusActions';
import OrderTimeline from '@/features/admin/orders/components/OrderTimeline';
import { formatDateTW } from '@/lib/format';
import { getAdminUser } from '@/features/admin/shared/admin-guard';

export const metadata: Metadata = {
  title: '訂單明細',
};

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;

  const admin = await getAdminUser();
  if (!admin) return null;

  const order = await getAdminOrderById(id);

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">
          {order.orderNumber}
        </h1>
        <p className="mt-1 text-muted-foreground">
          下單日期：{formatDateTW(order.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr] xl:items-start">
        <OrderDetail order={order} />
        <div className="flex flex-col gap-6">
          <OrderStatusActions order={order} />
          <OrderTimeline order={order} />
        </div>
      </div>
    </div>
  );
}
