'use server';

import { updateTag } from 'next/cache';
import { and, eq, notInArray } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { product, productVariant } from '@/db/schema';
import type { ActionResult } from '@/features/admin/shared/action-result';
import { isAdmin } from '@/features/admin/shared/admin-guard';
import { deleteProductImages } from '@/features/admin/products/delete-product-images';
import {
  productFormSchema,
  UNCATEGORIZED,
  type ProductFormValues,
} from '@/features/admin/products/schemas/product';

function toProductColumns(values: ProductFormValues) {
  return {
    name: values.name,
    slug: values.slug,
    categoryId: values.categoryId === UNCATEGORIZED ? null : values.categoryId,
    status: values.status,
    origin: values.origin || null,
    description: values.description || null,
    images: values.images.map((image) => image.url.trim()).filter(Boolean),
  };
}

function toVariantColumns(
  variant: ProductFormValues['variants'][number],
  productId: string,
) {
  return {
    productId,
    weightGrams: variant.weightGrams,
    label: variant.label || null,
    sku: variant.sku,
    price: variant.price,
    stock: variant.stock,
  };
}

/** 商品在編輯途中被刪掉時，要給出和「slug 重複」不一樣的訊息 */
class ProductNotFound extends Error {}

/** 規格在編輯途中被改掉（庫存被買走、規格被別人刪掉）時，要請使用者重新整理 */
class StaleVariant extends Error {}

export async function createProduct(
  values: ProductFormValues,
): Promise<ActionResult> {
  if (!(await isAdmin()))
    return { ok: false, message: '沒有權限執行這個操作 !' };

  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success)
    return { ok: false, message: '欄位格式有誤，請重新檢查 !' };

  const db = await getDatabase('fresh');

  try {
    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(product)
        .values(toProductColumns(parsed.data))
        .returning({ id: product.id });

      await tx
        .insert(productVariant)
        .values(
          parsed.data.variants.map((variant) =>
            toVariantColumns(variant, created.id),
          ),
        );
    });
  } catch {
    // slug 與 sku 都有 unique 限制，實務上撞到的幾乎都是這兩個
    return { ok: false, message: '新增失敗，網址代稱或 SKU 可能已經被使用 !' };
  }

  // 前台的商品列表掛著 products 這個 tag，商品頁也是從這份列表找，新商品要清了才會出現
  updateTag('products');

  return { ok: true };
}

export async function updateProduct(
  id: string,
  values: ProductFormValues,
): Promise<ActionResult> {
  if (!(await isAdmin()))
    return { ok: false, message: '沒有權限執行這個操作 !' };

  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success)
    return { ok: false, message: '欄位格式有誤，請重新檢查 !' };

  const db = await getDatabase('fresh');

  // 表單送回來的規格就是完整的清單：沒帶 id 的是新增，消失的代表被刪掉
  const keptIds = parsed.data.variants
    .map((variant) => variant.id)
    .filter((id) => id !== undefined);

  const columns = toProductColumns(parsed.data);
  // 圖片同理，只是刪掉的那幾張除了欄位，物件儲存裡的檔案也要一起清掉
  let removedImages: string[] = [];

  try {
    await db.transaction(async (tx) => {
      const [previous] = await tx
        .select({ images: product.images })
        .from(product)
        .where(eq(product.id, id));

      // 查不到代表商品已經被刪除；繼續往下 update 會是 no-op 卻回報成功
      if (!previous) throw new ProductNotFound();

      removedImages = (previous.images ?? []).filter(
        (url) => !columns.images.includes(url),
      );

      await tx.update(product).set(columns).where(eq(product.id, id));

      await tx
        .delete(productVariant)
        .where(
          keptIds.length > 0
            ? and(
                eq(productVariant.productId, id),
                notInArray(productVariant.id, keptIds),
              )
            : eq(productVariant.productId, id),
        );

      for (const variant of parsed.data.variants) {
        if (!variant.id) {
          await tx.insert(productVariant).values(toVariantColumns(variant, id));
          continue;
        }

        /**
         * 表單裡的庫存是開頁當下的快照，這段期間可能已經有人結帳扣掉了。
         * 沒改庫存就整欄不寫，才不會把賣掉的數量蓋回去（lost update）；
         * 改了的話，資料庫還得是開頁當下的數字才寫，否則命中 0 列、整筆 rollback。
         * 沒帶 originalStock 的只會是改版前就開著的舊頁面，照舊直接寫入。
         */
        const stockChanged = variant.stock !== variant.originalStock;
        const { stock, ...columns } = toVariantColumns(variant, id);

        const [updated] = await tx
          .update(productVariant)
          .set(stockChanged ? { ...columns, stock } : columns)
          .where(
            and(
              eq(productVariant.id, variant.id),
              // 只能改這個商品自己的規格
              eq(productVariant.productId, id),
              stockChanged && variant.originalStock !== undefined
                ? eq(productVariant.stock, variant.originalStock)
                : undefined,
            ),
          )
          .returning({ id: productVariant.id });

        if (!updated) throw new StaleVariant();
      }
    });
  } catch (error) {
    if (error instanceof ProductNotFound) {
      return { ok: false, message: '找不到這個商品，可能已經被刪除了 !' };
    }
    if (error instanceof StaleVariant) {
      return {
        ok: false,
        message: '規格或庫存在編輯期間有變動，請重新整理後再試 !',
      };
    }

    return { ok: false, message: '更新失敗，網址代稱或 SKU 可能已經被使用 !' };
  }

  // 交易成功了才動手：回滾的話資料庫還指著這幾張圖，檔案必須留著
  await deleteProductImages(removedImages);

  // 可能改到 slug 或 status，舊網址那份快取也會失真
  updateTag('products');

  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  if (!(await isAdmin()))
    return { ok: false, message: '沒有權限執行這個操作 !' };

  const db = await getDatabase('fresh');

  // 刪掉之後就查不到這個商品的圖片了，用 returning 在同一句裡把清單帶回來
  let images: string[] = [];

  try {
    // product_variant 設了 onDelete: cascade，規格會跟著一起刪掉
    const [deleted] = await db
      .delete(product)
      .where(eq(product.id, id))
      .returning({ images: product.images });

    images = deleted?.images ?? [];
  } catch {
    return { ok: false, message: '刪除失敗，請稍後再試 !' };
  }

  // 商品都不在了，圖片留在 bucket 裡也沒有人會再引用
  await deleteProductImages(images);

  // 不清的話商品頁還會繼續渲染已經刪掉的商品
  updateTag('products');

  return { ok: true };
}
