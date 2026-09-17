import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MOCK_PRODUCTS } from "@/features/products/mock-data";
import ProductGallery from "@/features/products/components/ProductGallery";
import ProductPurchasePanel from "@/features/products/components/ProductPurchasePanel";
import { formatPriceTWD } from "@/lib/format";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function getProductBySlug(slug: string) {
  return MOCK_PRODUCTS.find((product) => product.slug === slug);
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "商品不存在" };
  }

  return {
    title: product.name,
    description: product.description ?? `找茶 ${product.name}`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const prices = product.variants.map((variant) => variant.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-start">
      <ProductGallery images={product.images ?? []} alt={product.name} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl md:text-3xl">{product.name}</h1>
          {product.category && (
            <span className="text-sm text-muted-foreground">
              種類：{product.category.name}
            </span>
          )}
          {product.origin && (
            <span className="text-sm text-muted-foreground">
              產地：{product.origin}
            </span>
          )}
        </div>

        <p className="text-2xl font-semibold text-primary">
          {minPrice === null
            ? "價格洽詢"
            : minPrice === maxPrice
              ? formatPriceTWD(minPrice)
              : `${formatPriceTWD(minPrice)} - ${formatPriceTWD(maxPrice!)}`}
        </p>

        {product.description && (
          <p className="leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}

        <ProductPurchasePanel
          productId={product.id}
          productName={product.name}
          productSlug={product.slug}
          productImage={product.images?.[0] ?? null}
          variants={product.variants}
        />
      </div>
    </div>
  );
}
