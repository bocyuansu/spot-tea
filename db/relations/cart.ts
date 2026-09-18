import { defineRelationsPart } from 'drizzle-orm';

import * as schema from '@/db/schema';

export const cartRelations = defineRelationsPart(schema, (r) => ({
  cart: {
    user: r.one.user({
      from: r.cart.userId,
      to: r.user.id,
      optional: false,
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
      optional: false,
    }),
    productVariant: r.one.productVariant({
      from: r.cartItem.productVariantId,
      to: r.productVariant.id,
      optional: false,
    }),
  },
}));
