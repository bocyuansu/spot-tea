import { getDatabase } from '@/db/client';

/**
 * 收藏一律走 HYPERDRIVE_FRESH（沒有查詢快取）：
 * 剛在商品頁按下收藏，進收藏頁或重新整理就要看得到，走有快取的連線可能撈到按之前的結果。
 */
export async function listUserFavorites(userId: string) {
  const db = await getDatabase('fresh');

  return db.query.favorite.findMany({
    // 下架或改回草稿的商品點進去是 404，收藏頁就先不列出來；重新上架後會再出現
    where: { userId, product: { status: 'published' } },
    with: {
      // 與 listPublishedProducts 的形狀相同，收藏頁才能直接沿用 ProductCard
      product: {
        with: {
          category: true,
          variants: { orderBy: { weightGrams: 'asc' } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function isProductFavorited(userId: string, productId: string) {
  const db = await getDatabase('fresh');

  const row = await db.query.favorite.findFirst({
    where: { userId, productId },
    columns: { productId: true },
  });

  return row !== undefined;
}

export type FavoriteWithProduct = Awaited<
  ReturnType<typeof listUserFavorites>
>[number];
