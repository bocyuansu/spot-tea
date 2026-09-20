import { getSession } from '@/lib/session';
import { AdminSidebar } from '@/components/layout/admin/AdminSidebar';
import { AdminHeader } from '@/components/layout/admin/AdminHeader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AccessDenied from '@/features/admin/shared/components/AccessDenied';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // proxy.ts 只樂觀確認 cookie 在不在，真正的角色判斷在這一層
  if (session?.user.role !== 'admin') {
    return <AccessDenied />;
  }

  return (
    <SidebarProvider
      style={{ '--header-height': 'calc(var(--spacing) * 14)' } as React.CSSProperties}
    >
      <AdminSidebar user={session.user} />

      <SidebarInset>
        <AdminHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
