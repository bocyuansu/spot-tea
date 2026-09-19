import { z } from 'zod';

// 表單和 server action 共用同一份規則：action 是公開的 endpoint，不能只靠前端驗證
const requiredNumber = (message: string) => z.number({ error: message });

export const productVariantSchema = z.object({
  // 既有規格帶著 id 回來，新增的規格留空
  id: z.string().optional(),
  weightGrams: requiredNumber('請輸入淨重 !').int().positive('淨重必須大於 0 !'),
  label: z.string().max(20, '顯示名稱不得超過 20 個字 !'),
  sku: z.string().min(1, '請輸入 SKU !').max(40, 'SKU 不得超過 40 個字 !'),
  price: requiredNumber('請輸入價格 !').int().min(0, '價格不得小於 0 !'),
  stock: requiredNumber('請輸入庫存 !').int().min(0, '庫存不得小於 0 !'),
});

// 下拉選單的「未分類」用空字串，對應資料庫的 null
export const UNCATEGORIZED = '';

export const productFormSchema = z.object({
  name: z.string().min(1, '請輸入商品名稱 !').max(60, '商品名稱不得超過 60 個字 !'),
  slug: z
    .string()
    .min(1, '請輸入網址代稱 !')
    .max(60, '網址代稱不得超過 60 個字 !')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, '網址代稱只能使用小寫英文、數字與連字號 !'),
  // 可以是 UNCATEGORIZED
  categoryId: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  origin: z.string().max(30, '產地不得超過 30 個字 !'),
  description: z.string().max(500, '商品描述不得超過 500 個字 !'),
  // 一行一個圖片路徑，存進資料庫前再拆成陣列
  images: z.string(),
  variants: z.array(productVariantSchema).min(1, '至少要有一個規格 !'),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const emptyProductVariant: ProductFormValues['variants'][number] = {
  weightGrams: 150,
  label: '',
  sku: '',
  price: 0,
  stock: 0,
};
