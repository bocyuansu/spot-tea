'use server';

import { updateTag } from 'next/cache';
import { eq, inArray } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { category } from '@/db/schema';
import type { ActionResult } from '@/features/admin/shared/action-result';
import { isAdmin } from '@/features/admin/shared/admin-guard';
import {
  categoryFormSchema,
  categoryIdsSchema,
  type CategoryFormValues,
} from '@/features/admin/categories/schemas/category';

/**
 * 前台的分類清單與商品列表都掛著 categories 這個 tag，商品頁也是從商品列表找
 * （見 db/queries/products.ts），所以分類異動只要清這一個。
 */
const CATEGORIES_TAG = 'categories';

export async function createCategory(
  values: CategoryFormValues,
): Promise<ActionResult> {
  if (!(await isAdmin()))
    return { ok: false, message: '沒有權限執行這個操作 !' };

  const parsed = categoryFormSchema.safeParse(values);
  if (!parsed.success)
    return { ok: false, message: '欄位格式有誤，請重新檢查 !' };

  const db = await getDatabase('fresh');

  try {
    await db.insert(category).values(parsed.data);
  } catch {
    // slug 有 unique 限制，實務上撞到的幾乎都是它
    return { ok: false, message: '新增失敗，網址代稱可能已經被使用 !' };
  }

  updateTag(CATEGORIES_TAG);

  return { ok: true };
}

export async function updateCategory(
  id: string,
  values: CategoryFormValues,
): Promise<ActionResult> {
  if (!(await isAdmin()))
    return { ok: false, message: '沒有權限執行這個操作 !' };

  const parsed = categoryFormSchema.safeParse(values);
  if (!parsed.success)
    return { ok: false, message: '欄位格式有誤，請重新檢查 !' };

  const db = await getDatabase('fresh');

  try {
    const updated = await db
      .update(category)
      .set(parsed.data)
      .where(eq(category.id, id))
      .returning({ id: category.id });

    // 更新途中被別人刪掉的話 update 是 no-op，不擋就會回報成功
    if (updated.length === 0) {
      return { ok: false, message: '找不到這個分類，可能已經被刪除了 !' };
    }
  } catch {
    return { ok: false, message: '更新失敗，網址代稱可能已經被使用 !' };
  }

  updateTag(CATEGORIES_TAG);

  return { ok: true };
}

/** 分類列表勾選後的批次刪除 */
export async function deleteCategories(ids: string[]): Promise<ActionResult> {
  if (!(await isAdmin()))
    return { ok: false, message: '沒有權限執行這個操作 !' };

  const parsed = categoryIdsSchema.safeParse(ids);
  if (!parsed.success)
    return { ok: false, message: '欄位格式有誤，請重新檢查 !' };

  const db = await getDatabase('fresh');

  try {
    // product.categoryId 設了 onDelete: 'set null'，底下的商品會變成未分類而不是被刪掉
    await db.delete(category).where(inArray(category.id, parsed.data));
  } catch {
    return { ok: false, message: '刪除失敗，請稍後再試 !' };
  }

  updateTag(CATEGORIES_TAG);

  return { ok: true };
}
