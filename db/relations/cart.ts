import { defineRelationsPart } from 'drizzle-orm';

import * as cartSchema from '@/db/schema/cart';
import * as authSchema from '@/db/schema/auth';
import * as productSchema from '@/db/schema/product';

// user 與 productVariant 只是對向表格，它們自己的關聯在 auth.ts／product.ts
const schema = { ...cartSchema, ...authSchema, ...productSchema };

export const cartRelations = defineRelationsPart(schema, (r) => ({
  cart: {
    user: r.one.user({
      from: r.cart.userId,
      to: r.user.id,
    }),
    items: r.many.cartItem({
      from: r.cart.id,
      to: r.cartItem.cartId,
    }),
  },
  cartItem: {
    cart: r.one.cart({
      from: r.cartItem.cartId,
      to: r.cart.id,
    }),
    productVariant: r.one.productVariant({
      from: r.cartItem.productVariantId,
      to: r.productVariant.id,
    }),
  },
}));
