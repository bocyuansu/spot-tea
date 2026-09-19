'use client';

import { User } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type AuthButtonProps = {
  initialSession: typeof authClient.$Infer.Session | null;
};

export default function AuthButton({ initialSession }: AuthButtonProps) {
  // 避免 useSession 導致載入閃爍
  authClient.hydrateSession(initialSession);
  const { data, isPending, isRefetching } = authClient.useSession();
  const session = isPending && !isRefetching ? initialSession : data;

  if (session) {
    return (
      <>
        <MemberLink />
        <LogoutButton />
      </>
    );
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
// text-xs p-1 sm:text-sm sm:px-2 md:text-base md:px-3 md:py-2
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
