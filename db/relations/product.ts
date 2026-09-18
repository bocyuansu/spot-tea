import { defineRelationsPart } from 'drizzle-orm';

import * as schema from '@/db/schema';

export const productRelations = defineRelationsPart(schema, (r) => ({
  category: {
    products: r.many.product({
      from: r.category.id,
      to: r.product.categoryId,
    }),
  },
  product: {
    // categoryId 是 onDelete: 'set null' 的可空欄位，所以不加 optional: false
    category: r.one.category({
      from: r.product.categoryId,
      to: r.category.id,
    }),
    variants: r.many.productVariant({
      from: r.product.id,
      to: r.productVariant.productId,
    }),
  },
  productVariant: {
    product: r.one.product({
      from: r.productVariant.productId,
      to: r.product.id,
      optional: false,
    }),
    cartItems: r.many.cartItem({
      from: r.productVariant.id,
      to: r.cartItem.productVariantId,
    }),
    orderItems: r.many.orderItem({
      from: r.productVariant.id,
      to: r.orderItem.productVariantId,
    }),
  },
}));
