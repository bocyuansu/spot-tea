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
      className={cn(
        'text-xs p-1 sm:text-sm sm:px-2 md:text-base md:px-3 md:py-2',
        className,
        isActive && activeClassName,
      )}
    >
      {children}
    </Link>
  );
}
