import Image from 'next/image';
import Link from 'next/link';
import ActiveLink from '@/components/common/ActiveLink';
import AuthButton from '@/features/auth/components/AuthButton';
import { getSession } from '@/lib/session';
import MobileMenu from '@/components/layout/MobileMenu';
import CartBadge from '@/features/cart/components/CartBadge';
import DashboardLink from '@/features/admin/shared/components/DashboardLink';

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
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur shadow-xs">
      <div className="site-container flex justify-between items-center gap-2 px-4 py-2 sm:gap-4 md:gap-8">
        {/* LEFT */}
        <Link href="/" prefetch={false} className="flex items-center">
          <Image
            src="https://ik.imagekit.io/cyuan/public/spot-tea.jpg"
            alt="找茶 首頁"
            width={100}
            height={100}
            crossOrigin="anonymous"
            // sticky header 一直佔著畫面，logo 縮到手機 56px、桌機 80px
            className="size-14 md:size-20"
          />
        </Link>
        {/* CENTER */}
        <nav aria-label="主選單" className="hidden md:block">
          <ul className="flex">
            {links.map((link) => (
              <li key={link.label}>
                <ActiveLink
                  href={link.href}
                  className="hover:text-primary-strong"
                  activeClassName="text-primary-strong font-semibold"
                >
                  {link.label}
                </ActiveLink>
              </li>
            ))}
          </ul>
        </nav>
        {/* RIGHT */}
        <div className="hidden md:flex gap-3 items-center">
          {isAdmin && <DashboardLink />}
          <CartBadge />
          <AuthButton initialSession={session} />
        </div>
        {/* 手機版購物車留在選單外面，加入商品後不必打開選單就看得到數量 */}
        <div className="flex items-center gap-1 md:hidden">
          {/* <AuthButton initialSession={session} /> */}
          <CartBadge />
          <MobileMenu
            user={session?.user}
            isLoggedIn={!!session}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </header>
  );
}
