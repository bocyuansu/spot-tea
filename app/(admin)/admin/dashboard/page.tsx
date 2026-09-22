import type { Metadata } from 'next';
import { getAdminOverview } from '@/db/queries/admin/overview';
import StatCards from '@/features/admin/dashboard/components/StatCards';
import RecentOrders from '@/features/admin/dashboard/components/RecentOrders';
import LowStock from '@/features/admin/dashboard/components/LowStock';
import { getAdminUser } from '@/features/admin/shared/admin-guard';

export const metadata: Metadata = {
  title: '後台儀表板',
};

export default async function AdminDashboardPage() {
  // layout 已經顯示 AccessDenied；這裡擋的是 RSC payload 裡的頁面資料
  if (!(await getAdminUser())) return null;

  const overview = await getAdminOverview();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">儀表板</h1>
        <p className="mt-1 text-muted-foreground">營運概況一覽</p>
      </div>

      <StatCards overview={overview} />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr] xl:items-start">
        <RecentOrders orders={overview.recentOrders} />
        <LowStock variants={overview.lowStockVariants} />
      </div>
    </div>
  );
}
