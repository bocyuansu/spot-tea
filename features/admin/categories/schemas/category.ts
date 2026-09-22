import { z } from 'zod';

// 表單和 server action 共用同一份規則：action 是公開的 endpoint，不能只靠前端驗證
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, '請輸入分類名稱 !')
    .max(20, '分類名稱不得超過 20 個字 !'),
  // 前台用 ?category=<slug> 篩選商品，規則與商品的網址代稱一致
  slug: z
    .string()
    .min(1, '請輸入網址代稱 !')
    .max(40, '網址代稱不得超過 40 個字 !')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      '網址代稱只能使用小寫英文、數字與連字號 !',
    ),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const emptyCategory: CategoryFormValues = {
  name: '',
  slug: '',
};
