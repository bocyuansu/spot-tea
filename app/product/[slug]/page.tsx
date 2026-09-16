import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MOCK_PRODUCTS } from "@/app/products/page";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchasePanel from "@/components/ProductPurchasePanel";
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
        <div>
          {product.category && (
            <span className="text-xs text-muted-foreground">
              種類：{product.category.name}
            </span>
          )}
          <h1 className="font-heading text-2xl md:text-3xl">
            {product.name}
          </h1>
          {product.origin && (
            <p className="mt-1 text-sm text-muted-foreground">
              產地：{product.origin}
            </p>
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
          productName={product.name}
          variants={product.variants}
        />
      </div>
    </div>
  );
}
