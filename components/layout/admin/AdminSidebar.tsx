'use client';

import Link from 'next/link';
import {
  IconBrandProducthunt,
  IconDashboard,
  IconInnerShadowTop,
  IconLeaf,
  IconListDetails,
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
} from '@/components/ui/sidebar';
import { AdminNavMain } from './AdminNavMain';
import { AdminNavUser } from './AdminNavUser';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
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
  ],
};

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <AdminNavMain links={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <AdminNavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
