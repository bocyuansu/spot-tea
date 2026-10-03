import SiteChrome from '@/components/layout/SiteChrome';
import ActiveLink from '@/components/common/ActiveLink';

const links = [
  {
    href: '/user',
    label: '修改資料',
  },
  {
    href: '/user/orders',
    label: '我的訂單',
  },
  {
    href: '/user/favorites',
    label: '商品收藏',
  },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteChrome>
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <aside className="md:w-44 md:shrink-0">
          <nav className="flex gap-1 md:flex-col md:items-start">
            {links.map((link) => (
              <ActiveLink
                key={link.label}
                href={link.href}
                className="w-full rounded-md hover:text-primary-strong"
                activeClassName="bg-muted text-primary-strong font-semibold"
              >
                {link.label}
              </ActiveLink>
            ))}
          </nav>
        </aside>

        <div className="flex-1">{children}</div>
      </div>
    </SiteChrome>
  );
}
