import { defineRelationsPart } from 'drizzle-orm';

import * as orderSchema from '@/db/schema/order';
import * as authSchema from '@/db/schema/auth';
import * as productSchema from '@/db/schema/product';

// user 與 productVariant 只是對向表格，它們自己的關聯在 auth.ts／product.ts
const schema = { ...orderSchema, ...authSchema, ...productSchema };

export const orderRelations = defineRelationsPart(schema, (r) => ({
  order: {
    user: r.one.user({
      from: r.order.userId,
      to: r.user.id,
    }),
    items: r.many.orderItem({
      from: r.order.id,
      to: r.orderItem.orderId,
    }),
  },
  orderItem: {
    order: r.one.order({
      from: r.orderItem.orderId,
      to: r.order.id,
    }),
  },
}));
