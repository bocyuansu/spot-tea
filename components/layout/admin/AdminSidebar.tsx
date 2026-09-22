'use client';

import Link from 'next/link';
import {
  IconDashboard,
  IconLeaf,
  IconLeaf2,
  IconReceipt,
  IconUsers,
} from '@tabler/icons-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { AdminNavMain } from './AdminNavMain';
import { NavUser, type UserSummary } from '../NavUser';

const navMain = [
  {
    title: '儀表板',
    url: '/admin/dashboard',
    icon: IconDashboard,
  },
  {
    title: '商品管理',
    url: '/admin/products',
    icon: IconLeaf,
  },
  {
    title: '商品分類',
    url: '/admin/categories',
    icon: IconLeaf2,
  },
  {
    title: '訂單管理',
    url: '/admin/orders',
    icon: IconReceipt,
  },
  {
    title: '使用者管理',
    url: '/admin/users',
    icon: IconUsers,
  },
];

type AdminSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: UserSummary;
};

export function AdminSidebar({ user, ...props }: AdminSidebarProps) {
  const { isMobile } = useSidebar();

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
        <NavUser user={user} side={isMobile ? 'bottom' : 'right'} />
      </SidebarFooter>
    </Sidebar>
  );
}
