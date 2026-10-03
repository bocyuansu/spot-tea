'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type ActiveLinkProps = {
  href: string;
  className: string;
  activeClassName: string;
  children: React.ReactNode;
};

export default function ActiveLink({
  href,
  className,
  activeClassName,
  children,
}: ActiveLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        // 手機上也維持 14px 字與約 40px 高的點擊範圍
        'px-3 py-2.5 text-sm md:py-2 md:text-base',
        className,
        isActive && activeClassName,
      )}
    >
      {children}
    </Link>
  );
}
