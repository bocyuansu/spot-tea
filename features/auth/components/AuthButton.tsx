'use client';

import UserAvatar from '@/components/common/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import {
  IconHeart,
  IconMapPin,
  IconReceipt,
  IconShoppingBag,
  IconUserCircle,
} from '@tabler/icons-react';
import Link from 'next/link';

type AuthButtonProps = {
  initialSession: typeof authClient.$Infer.Session | null;
};

export type UserSummary = {
  name: string;
  email: string;
  image?: string | null;
};

export default function AuthButton({ initialSession }: AuthButtonProps) {
  // 避免 useSession 導致載入閃爍
  authClient.hydrateSession(initialSession);
  const { data, isPending, isRefetching } = authClient.useSession();
  const session = isPending && !isRefetching ? initialSession : data;

  if (session) {
    return <DropdownMenuAvatar user={session.user} />;
  }

  return <LoginButton />;
}

export function LoginButton() {
  return (
    <Link
      href="/login"
      prefetch={false}
      className="flex gap-1 items-center text-base hover:text-primary-strong"
    >
      <User className="size-6" />
      <span className="text-lg">登入</span>
    </Link>
  );
}

function DropdownMenuAvatar({ user }: { user: UserSummary }) {
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
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          // 只有頭像的按鈕，名稱要由 aria-label 給：沒有圖片時頭像沒有 alt 可以依靠
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="會員選單"
          >
            <UserAvatar image={user.image} />
          </Button>
        }
      />
      <DropdownMenuContent
        className="min-w-56"
        side="bottom"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <UserAvatar image={user.image} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>帳戶</DropdownMenuLabel>
          <DropdownMenuItem render={<Link href="/user" prefetch={false} />}>
            <IconUserCircle />
            <span>會員中心</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/user/orders" prefetch={false} />}
          >
            <IconReceipt />
            <span>訂單資料</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/user/favorites" prefetch={false} />}
          >
            <IconHeart />
            <span>商品收藏</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuLabel>商店</DropdownMenuLabel>
          <DropdownMenuItem render={<Link href="/products" prefetch={false} />}>
            <IconShoppingBag />
            <span>所有商品</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/store-location" prefetch={false} />}
          >
            <IconMapPin />
            <span>門市資訊</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          <span>登出</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
