'use server';

import { updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { and, desc, eq, gte, inArray, like, sql } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { order, orderItem, product, productVariant } from '@/db/schema';
import { createAuth } from '@/lib/auth';
import { calculateShippingFee } from '@/features/orders/shipping';
import {
  buildOrderNumber,
  buildOrderNumberPrefix,
  formatOrderDateStamp,
  nextOrderSequence,
} from '@/features/orders/order-number';
import {
  createOrderSchema,
  type CreateOrderInput,
} from '@/features/checkout/schemas/checkout';

export type CreateOrderResult =
  | { ok: true; orderNumber: string }
  // latestPrices 只在價格變動時出現，client 用它更新購物車裡的單價
  | { ok: false; message: string; latestPrices?: Record<string, number> };

// 同一個訂單編號被搶走時 pg 會回這個 code；drizzle 有時把原始錯誤包在 cause 裡
const UNIQUE_VIOLATION = '23505';
const MAX_ATTEMPTS = 3;

/** 把可以直接給使用者看的原因帶出 transaction，同時讓整筆交易 rollback */
class CheckoutError extends Error {}

/** 顧客看到的合計和資料庫算出來的不同，多帶回最新單價讓 client 更新購物車 */
class PriceChangedError extends CheckoutError {
  constructor(readonly latestPrices: Record<string, number>) {
    super('部分商品價格已更新，請確認新的金額後再送出訂單 !');
  }
}

function isDuplicateOrderNumber(error: unknown) {
  const { code, cause } = (error ?? {}) as {
    code?: string;
    cause?: { code?: string };
  };

  return code === UNIQUE_VIOLATION || cause?.code === UNIQUE_VIOLATION;
}

/**
 * 把購物車轉成訂單。
 *
 * server action 等同一個公開的 POST endpoint，proxy.ts 的樂觀 cookie 檢查擋不到它，
 * 所以這裡要自己確認身分。購物車存在 localStorage，client 只送規格與數量，
 * 品名、單價與庫存一律從資料庫重撈 —— 送進來的金額一概不採用。
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const auth = await createAuth();

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return { ok: false, message: '請先登入再結帳 !' };

  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, message: '欄位格式有誤，請重新檢查 !' };

  const {
    items: requestedItems,
    paymentMethod,
    note,
    expectedTotal,
    ...shippingAddress
  } = parsed.data;
  const db = await getDatabase('fresh');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const orderNumber = await db.transaction(async (tx) => {
        // 品名與單價的快照來源，和 db/seed.ts 的建單邏輯一致
        const rows = await tx
          .select({
            id: productVariant.id,
            price: productVariant.price,
            stock: productVariant.stock,
            label: productVariant.label,
            weightGrams: productVariant.weightGrams,
            productName: product.name,
            productStatus: product.status,
          })
          .from(productVariant)
          .innerJoin(product, eq(product.id, productVariant.productId))
          .where(
            inArray(
              productVariant.id,
              requestedItems.map((item) => item.variantId),
            ),
          );

        const rowByVariantId = new Map(rows.map((row) => [row.id, row]));

        const items = requestedItems.map((item) => {
          const row = rowByVariantId.get(item.variantId);

          if (!row || row.productStatus !== 'published') {
            throw new CheckoutError('購物車中有商品已下架，請重新確認 !');
          }

          // 這裡先擋一次是為了早點給出明確訊息，真正的防超賣在後面的扣庫存
          if (row.stock < item.quantity) {
            throw new CheckoutError(
              `「${row.productName}」庫存不足，請調整數量 !`,
            );
          }

          return {
            variantId: row.id,
            productName: row.productName,
            variantName: row.label ?? `${row.weightGrams}g`,
            unitPrice: row.price,
            quantity: item.quantity,
            subtotal: row.price * item.quantity,
          };
        });

        const subtotalAmount = items.reduce(
          (total, item) => total + item.subtotal,
          0,
        );
        const shippingFee = calculateShippingFee(subtotalAmount);

        // 運費也是由小計算出來的，所以比合計就涵蓋了改價造成的運費變化
        if (subtotalAmount + shippingFee !== expectedTotal) {
          throw new PriceChangedError(
            Object.fromEntries(
              items.map((item) => [item.variantId, item.unitPrice]),
            ),
          );
        }

        // 當天的最後一筆訂單決定序號；同一秒的併發會算出相同編號，
        // 由 orderNumber 的 unique 限制擋下來，再由外層重跑整筆交易
        const stamp = formatOrderDateStamp(new Date());
        const [latest] = await tx
          .select({ orderNumber: order.orderNumber })
          .from(order)
          .where(like(order.orderNumber, `${buildOrderNumberPrefix(stamp)}%`))
          .orderBy(desc(order.orderNumber))
          .limit(1);

        const nextOrderNumber = buildOrderNumber(
          stamp,
          nextOrderSequence(latest?.orderNumber),
        );

        // status 與 paymentStatus 走 schema 的預設值（pending / unpaid）：
        // 訂單流程從待處理開始，付款與否是另一條線：綠界信用卡由付款通知回寫，
        // 貨到付款與 ATM 匯款由後台手動確認
        const [createdOrder] = await tx
          .insert(order)
          .values({
            orderNumber: nextOrderNumber,
            userId: session.user.id,
            paymentProvider: paymentMethod,
            subtotalAmount,
            shippingFee,
            totalAmount: subtotalAmount + shippingFee,
            shippingAddress,
            note: note || null,
          })
          .returning({ id: order.id });

        await tx.insert(orderItem).values(
          items.map((item) => ({
            orderId: createdOrder.id,
            productVariantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
        );

        for (const item of items) {
          /**
           * 防超賣就靠這個帶條件的 UPDATE：庫存必須在資料庫端相減（sql`stock - n`），
           * 而且要用 stock >= quantity 當條件。兩個人搶最後一罐時，後到的那筆
           * 命中 0 列，returning() 回空陣列，整筆交易連同已扣的庫存一起 rollback。
           *
           * 千萬不要改成 set({ stock: row.stock - n })：那是典型的 lost update，
           * 會讓這裡的防護完全失效。
           */
          const [updated] = await tx
            .update(productVariant)
            .set({ stock: sql`${productVariant.stock} - ${item.quantity}` })
            .where(
              and(
                eq(productVariant.id, item.variantId),
                gte(productVariant.stock, item.quantity),
              ),
            )
            .returning({ id: productVariant.id });

          if (!updated) {
            throw new CheckoutError(
              `「${item.productName}」庫存不足，請調整數量 !`,
            );
          }
        }

        return nextOrderNumber;
      });

      // 庫存變了，而前台的商品列表內嵌 variants（商品頁也是從這份列表找），快取要清
      updateTag('products');

      return { ok: true, orderNumber };
    } catch (error) {
      // 購物車本身有問題，重試也不會變好
      if (error instanceof PriceChangedError) {
        return {
          ok: false,
          message: error.message,
          latestPrices: error.latestPrices,
        };
      }
      if (error instanceof CheckoutError)
        return { ok: false, message: error.message };

      if (isDuplicateOrderNumber(error) && attempt < MAX_ATTEMPTS) continue;

      return { ok: false, message: '訂單建立失敗，請稍後再試 !' };
    }
  }

  return { ok: false, message: '訂單建立失敗，請稍後再試 !' };
}
