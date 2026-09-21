import { defineRelationsPart } from 'drizzle-orm';

import * as schema from '@/db/schema';

export const orderRelations = defineRelationsPart(schema, (r) => ({
  order: {
    user: r.one.user({
      from: r.order.userId,
      to: r.user.id,
      optional: false,
    }),
    // updatedById 可空（沒有管理員動過，或最後一次是綠界通知），維持 user | null
    updatedBy: r.one.user({
      from: r.order.updatedById,
      to: r.user.id,
    }),
    items: r.many.orderItem({
      from: r.order.id,
      to: r.orderItem.orderId,
    }),
    events: r.many.orderEvent({
      from: r.order.id,
      to: r.orderEvent.orderId,
    }),
  },
  orderItem: {
    order: r.one.order({
      from: r.orderItem.orderId,
      to: r.order.id,
      optional: false,
    }),
    // productVariantId 是 onDelete: 'set null' 的可空欄位，商品被刪除後會變成 null，
    // 所以這裡刻意不加 optional: false，維持 productVariant | null
    productVariant: r.one.productVariant({
      from: r.orderItem.productVariantId,
      to: r.productVariant.id,
    }),
  },
  orderEvent: {
    order: r.one.order({
      from: r.orderEvent.orderId,
      to: r.order.id,
      optional: false,
    }),
    // actorId 可空（綠界付款通知），維持 user | null
    actor: r.one.user({
      from: r.orderEvent.actorId,
      to: r.user.id,
    }),
  },
}));
