import Image from 'next/image';
import Link from 'next/link';
import ActiveLink from '@/components/common/ActiveLink';
import AuthButton from '@/features/auth/components/AuthButton';
import { getSession } from '@/lib/session';
import MobileMenu from '@/components/layout/MobileMenu';
import CartBadge from '@/features/cart/components/CartBadge';
import DashboardLink from '@/features/admin/shared/components/DashboardLink';

// products?category=xxx
const links = [
  {
    href: '/products',
    label: '所有商品',
  },
  {
    href: '/store-location',
    label: '門市資訊',
  },
];

export default async function Navbar() {
  // 頁面本身通常也要 session，交給 lib/session.ts 的 cache() 每請求只查一次
  const session = await getSession();

  const isAdmin = session?.user.role === 'admin';

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur shadow-xs">
      <div className="site-container flex justify-between items-center gap-2 p-4 sm:gap-4 md:gap-8">
        {/* LEFT */}
        <Link href="/" prefetch={false} className="flex items-center">
          <Image
            src="https://ik.imagekit.io/cyuan/products/spot-tea.jpg"
            alt="Spot Tea logo"
            width={100}
            height={100}
            className="w-16 h-16 md:w-25 md:h-25"
          />
        </Link>
        {/* CENTER */}
        <ul className="hidden md:flex">
          {links.map((link) => (
            <li key={link.label}>
              <ActiveLink
                href={link.href}
                className="hover:text-primary"
                activeClassName="text-primary font-semibold"
              >
                {link.label}
              </ActiveLink>
            </li>
          ))}
        </ul>
        {/* RIGHT */}
        <div className="hidden md:flex gap-3 items-center">
          {isAdmin && <DashboardLink />}
          <CartBadge />
          <AuthButton initialSession={session} />
        </div>
        <div className="flex items-center md:hidden">
          <AuthButton initialSession={session} />
          <MobileMenu links={links} isLoggedIn={!!session} isAdmin={isAdmin} />
        </div>
      </div>
    </nav>
  );
}
