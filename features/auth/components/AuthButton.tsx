'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { IconMapPin, IconReceipt, IconShoppingBag, IconUserCircle } from '@tabler/icons-react';
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

export function MemberLink() {
  return (
    <Link
      href="/user"
      aria-label="會員中心"
      prefetch={false}
      className="hidden gap-1 md:flex md:gap-0 items-center text-xs sm:text-sm md:text-base hover:text-primary"
    >
      <User className="size-5 md:size-6" />
      <span className="hidden lg:inline">會員</span>
    </Link>
  );
}

export function LoginButton() {
  return (
    <Link
      href="/login"
      prefetch={false}
      className="flex gap-1 items-center text-xs sm:text-sm md:text-base hover:text-primary"
    >
      <User className="size-5 md:size-6" />
      <span>登入</span>
    </Link>
  );
}

export function LogoutButton() {
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
    <Button
      type="button"
      variant="ghost"
      onClick={handleLogout}
      className="px-0 gap-1 text-xs sm:text-sm md:gap-0 md:text-base hover:text-primary hover:bg-white"
    >
      <LogOut className="size-4 sm:size-5 md:size-6" />
      <span>登出</span>
    </Button>
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
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage src={user.image ?? ''} alt={user.name} />
              <AvatarFallback>
                <User className="size-5" />
              </AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent className="min-w-56" side="bottom" align="end" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar>
                <AvatarImage src={user.image ?? ''} alt={user.name} />
                <AvatarFallback>
                  <User className="size-5" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
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
          <DropdownMenuItem render={<Link href="/user/orders" prefetch={false} />}>
            <IconReceipt />
            <span>訂單資料</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuLabel>商店</DropdownMenuLabel>
          <DropdownMenuItem render={<Link href="/products" prefetch={false} />}>
            <IconShoppingBag />
            <span>所有商品</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/store-location" prefetch={false} />}>
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
