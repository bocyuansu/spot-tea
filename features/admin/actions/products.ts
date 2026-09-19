'use server';

import { updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { and, eq, notInArray } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { product, productVariant } from '@/db/schema';
import { createAuth } from '@/lib/auth';
import { productFormSchema, type ProductFormValues } from '@/features/admin/schemas/product';

export type ActionResult = { ok: true } | { ok: false; message: string };

/**
 * server action 等同一個公開的 POST endpoint，(admin)/layout.tsx 的角色判斷擋不到它，
 * 所以每個 action 都要自己再確認一次身分。
 */
async function isAdmin() {
  const auth = await createAuth();

  const session = await auth.api.getSession({ headers: await headers() });

  return session?.user.role === 'admin';
}

// 前台的商品查詢掛在 products 這個 tag 上；在 server action 裡用 updateTag 立即失效
function revalidateStorefront() {
  updateTag('products');
}

function toProductColumns(values: ProductFormValues) {
  return {
    name: values.name,
    slug: values.slug,
    // 下拉選單的「未分類」是空字串，資料庫存 null
    categoryId: values.categoryId || null,
    status: values.status,
    origin: values.origin || null,
    description: values.description || null,
    images: values.images
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  };
}

function toVariantColumns(variant: ProductFormValues['variants'][number], productId: string) {
  return {
    productId,
    weightGrams: variant.weightGrams,
    label: variant.label || null,
    sku: variant.sku,
    price: variant.price,
    stock: variant.stock,
  };
}

export async function createProduct(values: ProductFormValues): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: '沒有權限執行這個操作 !' };

  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: '欄位格式有誤，請重新檢查 !' };

  const db = await getDatabase('fresh');

  try {
    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(product)
        .values(toProductColumns(parsed.data))
        .returning({ id: product.id });

      await tx
        .insert(productVariant)
        .values(parsed.data.variants.map((variant) => toVariantColumns(variant, created.id)));
    });
  } catch {
    // slug 與 sku 都有 unique 限制，實務上撞到的幾乎都是這兩個
    return { ok: false, message: '新增失敗，網址代稱或 SKU 可能已經被使用 !' };
  }

  revalidateStorefront();

  return { ok: true };
}

export async function updateProduct(id: string, values: ProductFormValues): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: '沒有權限執行這個操作 !' };

  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: '欄位格式有誤，請重新檢查 !' };

  const db = await getDatabase('fresh');

  // 表單送回來的規格就是完整的清單：沒帶 id 的是新增，消失的代表被刪掉
  const keptIds = parsed.data.variants
    .map((variant) => variant.id)
    .filter((id) => id !== undefined);

  try {
    await db.transaction(async (tx) => {
      await tx.update(product).set(toProductColumns(parsed.data)).where(eq(product.id, id));

      await tx
        .delete(productVariant)
        .where(
          keptIds.length > 0
            ? and(eq(productVariant.productId, id), notInArray(productVariant.id, keptIds))
            : eq(productVariant.productId, id),
        );

      for (const variant of parsed.data.variants) {
        if (variant.id) {
          await tx
            .update(productVariant)
            .set(toVariantColumns(variant, id))
            .where(eq(productVariant.id, variant.id));
        } else {
          await tx.insert(productVariant).values(toVariantColumns(variant, id));
        }
      }
    });
  } catch {
    return { ok: false, message: '更新失敗，網址代稱或 SKU 可能已經被使用 !' };
  }

  revalidateStorefront();

  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: '沒有權限執行這個操作 !' };

  const db = await getDatabase('fresh');

  try {
    // product_variant 設了 onDelete: cascade，規格會跟著一起刪掉
    await db.delete(product).where(eq(product.id, id));
  } catch {
    return { ok: false, message: '刪除失敗，請稍後再試 !' };
  }

  revalidateStorefront();

  return { ok: true };
}
