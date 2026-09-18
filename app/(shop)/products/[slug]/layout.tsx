import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/products"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回所有商品
      </Link>
      {children}
    </div>
  );
}
