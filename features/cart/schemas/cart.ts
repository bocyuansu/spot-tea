import { z } from 'zod';

// 購物車目前存在 localStorage，資料可能被竄改或版本不符，讀取時一律驗證
export const cartItemSchema = z.object({
  variantId: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string().min(1),
  productSlug: z.string().min(1),
  variantLabel: z.string().min(1),
  image: z.string().nullable(),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

export const cartItemsSchema = z.array(cartItemSchema);

export type CartItem = z.infer<typeof cartItemSchema>;
