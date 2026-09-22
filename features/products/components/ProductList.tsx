import ProductCard from '@/features/products/components/ProductCard';
import type { ProductWithDetails } from '@/db/queries/products';

type ProductListProps = {
  products: ProductWithDetails[];
  activeCategorySlug?: string;
};

export default function ProductList({
  products,
  activeCategorySlug,
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <p>
          {activeCategorySlug
            ? '此分類目前尚無商品'
            : '目前尚無上架商品，敬請期待'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
