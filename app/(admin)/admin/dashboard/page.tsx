import type { Metadata } from 'next';
import { getAdminOverview } from '@/db/queries/admin';
import AdminStatCards from '@/features/admin/components/AdminStatCards';
import AdminRecentOrders from '@/features/admin/components/AdminRecentOrders';
import AdminLowStock from '@/features/admin/components/AdminLowStock';

export const metadata: Metadata = {
  title: '後台儀表板',
};

export default async function AdminDashboardPage() {
  const overview = await getAdminOverview();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">儀表板</h1>
        <p className="mt-1 text-muted-foreground">營運概況一覽</p>
      </div>

      <AdminStatCards overview={overview} />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr] xl:items-start">
        <AdminRecentOrders orders={overview.recentOrders} />
        <AdminLowStock variants={overview.lowStockVariants} />
      </div>
    </div>
  );
}
