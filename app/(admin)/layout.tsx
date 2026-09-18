import Link from 'next/link';
import ActiveLink from '@/components/common/ActiveLink';

const links = [
  {
    href: '/admin',
    label: '儀表板',
  },
  {
    href: '/admin/products',
    label: '商品管理',
  },
];

// 後台不共用前台導覽列，改用自己的側邊欄。
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col md:flex-row">
      <aside className="flex flex-col gap-4 border-b p-4 md:w-56 md:shrink-0 md:border-r md:border-b-0">
        <Link href="/admin" className="font-heading text-lg">
          找茶 後台
        </Link>
        <nav className="flex gap-1 md:flex-col md:items-start">
          {links.map((link) => (
            <ActiveLink
              key={link.label}
              href={link.href}
              className="w-full rounded-md hover:text-primary"
              activeClassName="bg-muted text-primary font-semibold"
            >
              {link.label}
            </ActiveLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
