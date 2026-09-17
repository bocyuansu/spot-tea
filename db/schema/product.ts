import { pgTable, text, timestamp, index, integer, pgEnum } from 'drizzle-orm/pg-core';

import { InferSelectModel } from 'drizzle-orm';

export const productStatusEnum = pgEnum('product_status', ['draft', 'published', 'archived']);

export const category = pgTable('category', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const product = pgTable(
  'product',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    categoryId: text('category_id').references(() => category.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    images: text('images').array(),
    status: productStatusEnum('status').default('draft').notNull(),
    // 茶區／產地，例如「南投鹿谷」「阿里山」，呼應品牌強調的台灣四大茶區
    origin: text('origin'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('product_categoryId_idx').on(table.categoryId),
    index('product_status_idx').on(table.status),
  ],
);

export const productVariant = pgTable(
  'product_variant',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text('product_id')
      .notNull()
      .references(() => product.id, { onDelete: 'cascade' }),
    // 淨重（克），例如 150 代表 150g；前端可據此自動換算「半斤／一斤」等顯示文字
    weightGrams: integer('weight_grams').notNull(),
    // 特殊包裝（例如「禮盒組」）用來覆寫顯示名稱，一般規格留空、由 weightGrams 自動產生
    label: text('label'),
    // Stock Keeping Unit 庫存單位
    sku: text('sku').notNull().unique(),
    price: integer('price').notNull(),
    stock: integer('stock').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('productVariant_productId_idx').on(table.productId)],
);

// 型別
export type Product = InferSelectModel<typeof product>;
