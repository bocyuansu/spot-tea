import { pgTable, text, timestamp, index, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { productVariant } from './product';

export const cart = pgTable('cart', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const cartItem = pgTable(
  'cart_item',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    cartId: text('cart_id')
      .notNull()
      .references(() => cart.id, { onDelete: 'cascade' }),
    productVariantId: text('product_variant_id')
      .notNull()
      .references(() => productVariant.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').default(1).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('cartItem_cartId_idx').on(table.cartId),
    uniqueIndex('cartItem_cartId_variantId_idx').on(table.cartId, table.productVariantId),
  ],
);
