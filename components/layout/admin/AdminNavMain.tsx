'use client';

import Link from 'next/link';
import { IconHome, type Icon } from '@tabler/icons-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AdminNavMain({
  links,
}: {
  links: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {links.map((link) => (
              <SidebarMenuItem key={link.title}>
                <SidebarMenuButton
                  render={<Link href={link.url} prefetch={false} />}
                >
                  {link.icon && <link.icon />}
                  <span>{link.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="mt-auto">
        <SidebarGroupContent>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" prefetch={false} />}>
              <IconHome />
              <span>檢視商店</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
