import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import ProductCard from "@/components/ProductCard";
import type { ProductWithDetails } from "@/db/queries/products";

export const metadata: Metadata = {
  title: "所有商品",
  description: "找茶 所有商品",
};

type ProductsPageProps = {
  searchParams: Promise<{ category?: string }>;
};

// TODO: 暫時使用 Mock 資料以便預覽畫面，待串接後端後改回 listCategories / listPublishedProducts
export const MOCK_CATEGORIES = [
  { id: "cat-1", name: "南投鹿谷", slug: "nantou-lugu", createdAt: new Date() },
  { id: "cat-2", name: "阿里山", slug: "alishan", createdAt: new Date() },
  {
    id: "cat-3",
    name: "坪林文山",
    slug: "pinglin-wenshan",
    createdAt: new Date(),
  },
  { id: "cat-4", name: "大禹嶺", slug: "dayuling", createdAt: new Date() },
];

export const MOCK_PRODUCTS: ProductWithDetails[] = [
  {
    id: "prod-1",
    categoryId: "cat-1",
    name: "凍頂烏龍茶",
    slug: "dong-ding-oolong",
    description: "香氣濃郁、喉韻回甘的經典凍頂烏龍。",
    images: [
      "/assets/spot-tea.jpg",
      "/assets/dong-ding-oolong-01.avif",
      "/assets/dong-ding-oolong-02.avif",
    ],
    status: "published",
    origin: "南投鹿谷",
    createdAt: new Date(),
    updatedAt: new Date(),
    category: MOCK_CATEGORIES[0],
    variants: [
      {
        id: "var-1",
        productId: "prod-1",
        weightGrams: 150,
        label: null,
        sku: "DDOL-150",
        price: 680,
        stock: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "var-2",
        productId: "prod-1",
        weightGrams: 600,
        label: null,
        sku: "DDOL-600",
        price: 2280,
        stock: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    id: "prod-2",
    categoryId: "cat-2",
    name: "阿里山金萱茶",
    slug: "alishan-jinxuan",
    description: "帶有奶香與淡淡花香的高山茶。",
    images: ["/assets/spot-tea.jpg"],
    status: "published",
    origin: "阿里山",
    createdAt: new Date(),
    updatedAt: new Date(),
    category: MOCK_CATEGORIES[1],
    variants: [
      {
        id: "var-3",
        productId: "prod-2",
        weightGrams: 150,
        label: null,
        sku: "ALJX-150",
        price: 780,
        stock: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    id: "prod-3",
    categoryId: "cat-3",
    name: "文山包種茶",
    slug: "wenshan-baozhong",
    description: "清香淡雅，適合日常沖泡的輕發酵茶。",
    images: [],
    status: "published",
    origin: "坪林文山",
    createdAt: new Date(),
    updatedAt: new Date(),
    category: MOCK_CATEGORIES[2],
    variants: [
      {
        id: "var-4",
        productId: "prod-3",
        weightGrams: 150,
        label: null,
        sku: "WSBZ-150",
        price: 520,
        stock: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    id: "prod-4",
    categoryId: "cat-4",
    name: "大禹嶺高山茶禮盒",
    slug: "dayuling-gift-box",
    description: "產量稀少的高冷茶，適合送禮的精緻禮盒組。",
    images: ["/assets/spot-tea.jpg"],
    status: "published",
    origin: "大禹嶺",
    createdAt: new Date(),
    updatedAt: new Date(),
    category: MOCK_CATEGORIES[3],
    variants: [
      {
        id: "var-5",
        productId: "prod-4",
        weightGrams: 300,
        label: "禮盒組",
        sku: "DYL-GIFT-300",
        price: 3200,
        stock: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
];

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { category: activeCategorySlug } = await searchParams;

  const categories = MOCK_CATEGORIES;
  const products = activeCategorySlug
    ? MOCK_PRODUCTS.filter(
        (product) => product.category?.slug === activeCategorySlug,
      )
    : MOCK_PRODUCTS;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">所有商品</h1>
        <p className="mt-1 text-muted-foreground">探索台灣四大茶區的嚴選好茶</p>
      </div>

      {categories.length > 0 && (
        <nav className="flex flex-wrap gap-2">
          <Link
            href="/products"
            className={cn(
              buttonVariants({
                variant: activeCategorySlug ? "outline" : "default",
                size: "sm",
              }),
              "rounded-full",
            )}
          >
            全部
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className={cn(
                buttonVariants({
                  variant:
                    activeCategorySlug === category.slug
                      ? "default"
                      : "outline",
                  size: "sm",
                }),
                "rounded-full",
              )}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      )}

      {products.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
          <p>
            {activeCategorySlug
              ? "此分類目前尚無商品"
              : "目前尚無上架商品，敬請期待"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
