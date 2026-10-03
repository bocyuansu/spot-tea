'use client';

// UI
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
// Icon
import { Heart, LayoutDashboard, Menu, ShoppingCart, User } from 'lucide-react';
import { IconShoppingBag, IconMapPin } from '@tabler/icons-react';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { NavUser } from './NavUser';
import { LoginButton } from '@/features/auth/components/AuthButton';

type User = typeof authClient.$Infer.Session.user | undefined;

type MobileMenuProps = {
  user: User;
  isLoggedIn: boolean;
  isAdmin: boolean;
};

export default function MobileMenu({
  user,
  isLoggedIn,
  isAdmin,
}: MobileMenuProps) {
  return (
    <SidebarProvider className="min-h-0">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="link"
              aria-label="切換選單"
              className="size-11 border-0 p-0 text-foreground"
            >
              <Menu className="size-6" />
            </Button>
          }
        />
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>商店導覽</SheetTitle>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-2 px-4">
            <SheetClose
              render={
                <Link
                  href="/products"
                  prefetch={false}
                  className="flex items-center gap-2 py-2.5 hover:text-primary-strong"
                >
                  <IconShoppingBag className="size-5" />
                  所有商品
                </Link>
              }
            />
            <SheetClose
              render={
                <Link
                  href="/store-location"
                  prefetch={false}
                  className="flex items-center gap-2 py-2.5 hover:text-primary-strong"
                >
                  <IconMapPin className="size-5" />
                  門市資訊
                </Link>
              }
            />
            <SheetClose
              render={
                <Link
                  href="/cart"
                  prefetch={false}
                  className="flex items-center gap-2 py-2.5 hover:text-primary-strong"
                >
                  <ShoppingCart className="size-5" />
                  購物車
                </Link>
              }
            />
            {isLoggedIn && (
              <SheetClose
                render={
                  <Link
                    href="/user"
                    prefetch={false}
                    className="flex items-center gap-2 py-2.5 hover:text-primary-strong"
                  >
                    <User className="size-5" />
                    <span>會員中心</span>
                  </Link>
                }
              />
            )}
            {isLoggedIn && (
              <SheetClose
                render={
                  <Link
                    href="/user/favorites"
                    prefetch={false}
                    className="flex items-center gap-2 py-2.5 hover:text-primary-strong"
                  >
                    <Heart className="size-5" />
                    <span>商品收藏</span>
                  </Link>
                }
              />
            )}
            {isAdmin && (
              <SheetClose
                render={
                  <Link
                    href="/admin/dashboard"
                    prefetch={false}
                    className="flex items-center gap-2 py-2.5 hover:text-primary-strong"
                  >
                    <LayoutDashboard className="size-5" />
                    <span>管理員後台</span>
                  </Link>
                }
              />
            )}
          </div>
          <SheetFooter>
            {user ? <NavUser user={user} /> : <LoginButton />}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}
