import { headers } from 'next/headers';
import { createAuth } from '@/lib/auth';
import { AdminSidebar } from '@/components/layout/admin/AdminSidebar';
import { AdminHeader } from '@/components/layout/admin/AdminHeader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AdminAccessDenied from '@/features/admin/components/AdminAccessDenied';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await createAuth();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // proxy.ts 只樂觀確認 cookie 在不在，真正的角色判斷在這一層
  if (session?.user.role !== 'admin') {
    return <AdminAccessDenied />;
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
