import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProductWithDetails } from '@/db/queries/products';

type Category = NonNullable<ProductWithDetails['category']>;

type CategoriesProps = {
  categories: Category[];
  activeCategorySlug?: string;
};

export default function Categories({
  categories,
  activeCategorySlug,
}: CategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        href="/products"
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
          href={`/products?category=${category.slug}`}
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
