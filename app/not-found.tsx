import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

const links = [
  {
    href: '/products',
    label: '所有商品',
  },
  {
    href: '/store-location',
    label: '門市資訊',
  },
  {
    href: '/cart',
    label: '購物車',
  },
];

export default function NotFound() {
  return (
    <section className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="space-y-8">
        <p className="font-heading text-5xl md:text-6xl text-primary">404</p>
        <h1 className="font-heading text-2xl md:text-3xl">
          頁面可能已經下架，或是網址輸入有誤。
        </h1>
      </div>

      <Link
        href="/"
        prefetch={false}
        className={buttonVariants({ size: 'lg' })}
      >
        回首頁
      </Link>

      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>或者逛逛</span>
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            prefetch={false}
            className="hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
