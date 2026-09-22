import { AdminSidebar } from '@/components/layout/admin/AdminSidebar';
import { AdminHeader } from '@/components/layout/admin/AdminHeader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AccessDenied from '@/features/admin/shared/components/AccessDenied';
import { getAdminUser } from '@/features/admin/shared/admin-guard';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  // proxy.ts 只樂觀確認 cookie 在不在，真正的角色判斷在這一層。
  // 這裡只決定畫面：頁面的資料照樣會被送出，所以每個頁面也要自己確認
  if (!admin) {
    return <AccessDenied />;
  }

  return (
    <SidebarProvider
      style={
        {
          '--header-height': 'calc(var(--spacing) * 14)',
        } as React.CSSProperties
      }
    >
      <AdminSidebar user={admin} />

      <SidebarInset>
        <AdminHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
