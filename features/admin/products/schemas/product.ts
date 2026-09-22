import { z } from 'zod';

// 表單和 server action 共用同一份規則：action 是公開的 endpoint，不能只靠前端驗證
const requiredNumber = (message: string) => z.number({ error: message });

export const productVariantSchema = z.object({
  // 既有規格帶著 id 回來，新增的規格留空
  id: z.string().optional(),
  weightGrams: requiredNumber('請輸入淨重 !')
    .int()
    .positive('淨重必須大於 0 !'),
  label: z.string().max(20, '顯示名稱不得超過 20 個字 !'),
  sku: z.string().min(1, '請輸入 SKU !').max(40, 'SKU 不得超過 40 個字 !'),
  price: requiredNumber('請輸入價格 !').int().min(0, '價格不得小於 0 !'),
  stock: requiredNumber('請輸入庫存 !').int().min(0, '庫存不得小於 0 !'),
  // 既有規格開頁當下的庫存，給 updateProduct 當樂觀鎖：庫存沒改就不寫回去，
  // 改了也要資料庫還是這個數字才寫，才不會把編輯期間賣掉的數量蓋掉。新增的規格沒有
  originalStock: z.number().int().nonnegative().optional(),
});

/**
 * useFieldArray 只吃物件，所以圖片包一層 url。
 * 已經存進資料庫的圖片只有 url，也就是公開網址；
 * 剛從電腦挑進來的還沒上傳，url 是 URL.createObjectURL() 的預覽網址，
 * file 留到表單送出時才真的傳上物件儲存，屆時 url 會換成公開網址。
 */
export const productImageSchema = z.object({
  url: z
    .string()
    .min(1, '圖片網址不正確 !')
    .max(300, '圖片網址不得超過 300 個字 !'),
  file: z.instanceof(File).optional(),
});

// 下拉選單的「未分類」用空字串，對應資料庫的 null
export const UNCATEGORIZED = '';

export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, '請輸入商品名稱 !')
    .max(60, '商品名稱不得超過 60 個字 !'),
  slug: z
    .string()
    .min(1, '請輸入網址代稱 !')
    .max(60, '網址代稱不得超過 60 個字 !')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      '網址代稱只能使用小寫英文、數字與連字號 !',
    ),
  // 可以是 UNCATEGORIZED
  categoryId: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  origin: z.string().max(30, '產地不得超過 30 個字 !'),
  description: z.string().max(500, '商品描述不得超過 500 個字 !'),
  // 第一張是封面，順序就是前台圖庫的顯示順序
  images: z.array(productImageSchema),
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
