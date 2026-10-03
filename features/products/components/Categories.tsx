import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProductsHref } from '@/features/products/product-catalog';
import type { ProductWithDetails } from '@/db/queries/products';

type Category = NonNullable<ProductWithDetails['category']>;

type CategoriesProps = {
  categories: Category[];
  /** 膠囊上的款數從這份清單算：商品頁傳關鍵字篩過的結果，數字才會跟點下去看到的一致 */
  products: ProductWithDetails[];
  /** 商品頁要能回到「全部」；首頁只是入口，不需要 */
  showAll?: boolean;
  activeCategorySlug?: string;
  query?: string;
};

export default function Categories({
  categories,
  products,
  showAll = false,
  activeCategorySlug,
  query,
}: CategoriesProps) {
  if (categories.length === 0) return null;

  const chips = [
    ...(showAll
      ? [{ key: 'all', slug: undefined, name: '全部', count: products.length }]
      : []),
    ...categories.map((category) => ({
      key: category.id,
      slug: category.slug,
      name: category.name,
      count: products.filter((product) => product.category?.id === category.id)
        .length,
    })),
  ];

  return (
    // 茶區數量由後台決定，用會自動換行的膠囊，幾個都排得下
    <nav aria-label="茶區分類" className="flex flex-wrap gap-3">
      {chips.map((chip) => {
        const isActive = chip.slug === activeCategorySlug;

        return (
          // 換分類時保留關鍵字，在新的分類裡繼續搜尋；頁碼則回到第一頁
          <Link
            key={chip.key}
            href={getProductsHref({ category: chip.slug, query })}
            prefetch={false}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-2 rounded-full py-2 pr-4 pl-2 ring-1 ring-foreground/10 transition-colors hover:bg-primary/10 hover:ring-primary',
              isActive && 'bg-primary/10 ring-primary',
            )}
          >
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary-foreground transition-colors group-hover:bg-primary',
                isActive && 'bg-primary',
              )}
            >
              <Leaf className="size-4" />
            </span>
            <span className="font-heading">{chip.name}</span>
            <span className="text-xs text-muted-foreground">
              {chip.count} 款
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
