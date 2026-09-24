import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getProductsHref } from '@/features/products/product-catalog';

type ProductPaginationProps = {
  page: number;
  totalPages: number;
  activeCategorySlug?: string;
  query: string;
};

type PageLinkProps = {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
};

function PageLink({ href, disabled, children }: PageLinkProps) {
  const className = buttonVariants({ variant: 'outline' });

  // 第一頁沒有上一頁、最後一頁沒有下一頁：連結不能 disabled，改成不可點的 span 保留位置
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(className, 'pointer-events-none opacity-50')}
      >
        {children}
      </span>
    );
  }

  return (
    <Link href={href} prefetch={false} className={className}>
      {children}
    </Link>
  );
}

export default function ProductPagination({
  page,
  totalPages,
  activeCategorySlug,
  query,
}: ProductPaginationProps) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) =>
    getProductsHref({ category: activeCategorySlug, query, page: target });

  return (
    <nav
      aria-label="商品分頁"
      className="flex items-center justify-center gap-4"
    >
      <PageLink href={hrefFor(page - 1)} disabled={page <= 1}>
        <ChevronLeft />
        上一頁
      </PageLink>
      <p className="text-sm text-muted-foreground">
        第 {page} / {totalPages} 頁
      </p>
      <PageLink href={hrefFor(page + 1)} disabled={page >= totalPages}>
        下一頁
        <ChevronRight />
      </PageLink>
    </nav>
  );
}
