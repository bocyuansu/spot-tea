import type { Metadata } from 'next';
import { listAdminOrders } from '@/db/queries/admin/orders';
import OrderTable from '@/features/admin/orders/components/OrderTable';
import { getAdminUser } from '@/features/admin/shared/admin-guard';

export const metadata: Metadata = {
  title: '訂單管理',
};

export default async function AdminOrdersPage() {
  // layout 已經顯示 AccessDenied；這裡擋的是 RSC payload 裡的頁面資料
  if (!(await getAdminUser())) return null;

  const orders = await listAdminOrders();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">訂單管理</h1>
        <p className="mt-1 text-muted-foreground">共 {orders.length} 筆訂單</p>
      </div>

      <OrderTable orders={orders} />
    </div>
  );
}
