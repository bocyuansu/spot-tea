'use client';

// UI
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
// Icon
import { IconDotsVertical, IconLogout } from '@tabler/icons-react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';

// 只需要顯示用的欄位，不必把整個 better-auth 的 user 型別拉進來
export type UserSummary = {
  name: string;
  email: string;
  image?: string | null;
};

type NavUserProps = {
  user: UserSummary;
  // 不在元件內呼叫 useSidebar：手機選單的 Sheet 外面沒有 SidebarProvider，由呼叫端決定彈出方向
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
};

function UserInfo({ user }: { user: UserSummary }) {
  return (
    <>
      <Avatar>
        <AvatarImage src={user.image ?? ''} alt={user.name} />
        <AvatarFallback>
          <User className="size-5" />
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {user.email}
        </span>
      </div>
    </>
  );
}

export function NavUser({
  user,
  side = 'bottom',
  sideOffset = 8,
}: NavUserProps) {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.add({
            type: 'success',
            description: '登出成功 !',
          });
          router.refresh();
        },
        onError: ({ error }) => {
          console.error(error.error.message);
          toast.add({
            type: 'error',
            description: error.error.message,
            priority: 'high',
          });
        },
      },
    });
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <UserInfo user={user} />
            <IconDotsVertical className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={side}
            align="end"
            sideOffset={sideOffset}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserInfo user={user} />
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <IconLogout />
              登出
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
