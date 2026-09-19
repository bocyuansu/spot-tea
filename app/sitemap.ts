import type { MetadataRoute } from 'next';
import { listPublishedProducts } from '@/db/queries/products';

const baseUrl = 'https://spot-tea.cyuan.workers.dev';

// 商品清單來自資料庫（Hyperdrive 只在 Worker runtime 可用），不能在 build 階段預先產生。
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 靜態頁面
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/store-location`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 動態頁面：已上架的商品（listPublishedProducts 本身有 unstable_cache，不會每次請求都打 DB）
  const products = await listPublishedProducts();
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
