import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getProductsHref } from '@/features/products/product-catalog';
import type { ProductWithDetails } from '@/db/queries/products';

type Category = NonNullable<ProductWithDetails['category']>;

type CategoriesProps = {
  categories: Category[];
  activeCategorySlug?: string;
  query: string;
};

export default function Categories({
  categories,
  activeCategorySlug,
  query,
}: CategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <nav className="flex flex-wrap gap-2">
      {/* 換分類時保留關鍵字，在新的分類裡繼續搜尋；頁碼則回到第一頁 */}
      <Link
        href={getProductsHref({ query })}
        prefetch={false}
        className={cn(
          buttonVariants({
            variant: activeCategorySlug ? 'outline' : 'default',
            size: 'sm',
          }),
          'rounded-full',
        )}
      >
        全部
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={getProductsHref({ category: category.slug, query })}
          prefetch={false}
          className={cn(
            buttonVariants({
              variant:
                activeCategorySlug === category.slug ? 'default' : 'outline',
              size: 'sm',
            }),
            'rounded-full',
          )}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
