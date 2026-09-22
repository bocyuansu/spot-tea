import { eq, sql } from 'drizzle-orm';
import type { getDatabase } from '@/db/client';
import { orderItem, productVariant } from '@/db/schema';

type Database = Awaited<ReturnType<typeof getDatabase>>;
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

/**
 * 取消訂單時把商品補回庫存，後台與顧客的取消共用。
 *
 * 只能在「把訂單改成已取消」的條件式 UPDATE 命中之後、同一筆交易裡呼叫：
 * 那個 UPDATE 保證同一張訂單只會取消一次，庫存也就只會補一次。
 * 跟結帳扣庫存一樣在資料庫端相加，不要讀出來算好再寫回去。
 */
export async function restoreOrderStock(tx: Transaction, orderId: string) {
  const items = await tx
    .select({
      variantId: orderItem.productVariantId,
      quantity: orderItem.quantity,
    })
    .from(orderItem)
    .where(eq(orderItem.orderId, orderId));

  for (const item of items) {
    // 規格被刪除後 productVariantId 會變成 null，已經沒有庫存可以補
    if (!item.variantId) continue;

    await tx
      .update(productVariant)
      .set({ stock: sql`${productVariant.stock} + ${item.quantity}` })
      .where(eq(productVariant.id, item.variantId));
  }
}
