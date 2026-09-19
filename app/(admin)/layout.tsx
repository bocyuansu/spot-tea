import { AdminSidebar } from '@/components/layout/admin/AdminSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />

      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
