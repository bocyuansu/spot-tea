'use server';

import { and, eq } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { favorite } from '@/db/schema';
import { getSession } from '@/lib/session';

export type SetFavoriteResult = { ok: true } | { ok: false; message: string };

/**
 * 把商品加入或移出收藏。
 *
 * 傳入的是「要變成什麼」而不是切換：連點兩下或兩個分頁各按一次，結果都跟最後一次一致。
 * 重複加入由複合主鍵擋下（onConflictDoNothing），移除不存在的收藏則是命中 0 列，兩者都算成功。
 * server action 等同一個公開的 POST endpoint，要自己確認身分，且只動得到自己的收藏。
 */
export async function setFavorite(
  productId: string,
  favorited: boolean,
): Promise<SetFavoriteResult> {
  const session = await getSession();
  if (!session) return { ok: false, message: '請先登入再收藏商品 !' };

  const db = await getDatabase('fresh');

  try {
    if (favorited) {
      await db
        .insert(favorite)
        .values({ userId: session.user.id, productId })
        .onConflictDoNothing();
    } else {
      await db
        .delete(favorite)
        .where(
          and(
            eq(favorite.userId, session.user.id),
            eq(favorite.productId, productId),
          ),
        );
    }
  } catch {
    // 商品在這之間被刪掉時，外鍵會擋下 INSERT
    return {
      ok: false,
      message: favorited
        ? '收藏失敗，請稍後再試 !'
        : '取消收藏失敗，請稍後再試 !',
    };
  }

  return { ok: true };
}
