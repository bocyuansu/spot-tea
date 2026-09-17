import { defineRelationsPart } from 'drizzle-orm';

import * as productSchema from '@/db/schema/product';
import * as cartSchema from '@/db/schema/cart';
import * as orderSchema from '@/db/schema/order';

// cartItem 與 orderItem 只是 productVariant 關聯的對向表格，它們自己的關聯在 cart.ts／order.ts
const schema = { ...productSchema, ...cartSchema, ...orderSchema };

export const productRelations = defineRelationsPart(schema, (r) => ({
  category: {
    products: r.many.product({
      from: r.category.id,
      to: r.product.categoryId,
    }),
  },
  product: {
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
