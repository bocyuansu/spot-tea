'use client';

import Link from 'next/link';
import { IconDashboard, IconLeaf, IconUsers } from '@tabler/icons-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { AdminNavMain } from './AdminNavMain';
import { AdminNavUser, type AdminUserSummary } from './AdminNavUser';

const navMain = [
  {
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: IconDashboard,
  },
  {
    title: 'Products',
    url: '/admin/products',
    icon: IconLeaf,
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: IconUsers,
  },
];

type AdminSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: AdminUserSummary;
};

export function AdminSidebar({ user, ...props }: AdminSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/admin" />}>
              <IconLeaf />
              Spot Tea
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <AdminNavMain links={navMain} />
      </SidebarContent>

      <SidebarFooter>
        <AdminNavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
