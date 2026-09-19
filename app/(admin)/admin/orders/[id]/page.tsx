import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminOrderById } from '@/db/queries/admin/orders';
import OrderDetail from '@/features/admin/orders/components/OrderDetail';
import OrderStatusForm from '@/features/admin/orders/components/OrderStatusForm';
import { formatDateTW } from '@/lib/format';

export const metadata: Metadata = {
  title: '訂單明細',
};

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;

  const order = await getAdminOrderById(id);

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">{order.orderNumber}</h1>
        <p className="mt-1 text-muted-foreground">下單日期：{formatDateTW(order.createdAt)}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr] xl:items-start">
        <OrderDetail order={order} />
        <OrderStatusForm order={order} />
      </div>
    </div>
  );
}
