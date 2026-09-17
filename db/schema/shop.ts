import {
  pgTable,
  text,
  timestamp,
  index,
  integer,
  jsonb,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { InferSelectModel } from 'drizzle-orm';

export const productStatusEnum = pgEnum('product_status', ['draft', 'published', 'archived']);

export const orderStatusEnum = pgEnum('order_status', [
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
  'refunded',
]);

export const paymentStatusEnum = pgEnum('payment_status', ['unpaid', 'paid', 'failed', 'refunded']);

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

export const order = pgTable(
  'order',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // 給客服/客戶使用的可讀訂單編號，與內部 id 分開
    orderNumber: text('order_number').notNull().unique(),
    // 不設 onDelete：訂單是財務紀錄，不應隨使用者刪除而被連動刪除
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    status: orderStatusEnum('status').default('pending_payment').notNull(),
    paymentStatus: paymentStatusEnum('payment_status').default('unpaid').notNull(),
    paymentProvider: text('payment_provider'),
    paymentTransactionId: text('payment_transaction_id'),
    subtotalAmount: integer('subtotal_amount').notNull(),
    shippingFee: integer('shipping_fee').default(0).notNull(),
    totalAmount: integer('total_amount').notNull(),
    // 下單當下的收件資訊快照，與使用者未來可能修改的個人資料脫鉤
    shippingAddress: jsonb('shipping_address').notNull().$type<{
      recipientName: string;
      phone: string;
      postalCode: string;
      city: string;
      district: string;
      addressLine: string;
    }>(),
    note: text('note'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('order_userId_idx').on(table.userId),
    index('order_status_idx').on(table.status),
  ],
);

export const orderItem = pgTable(
  'order_item',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text('order_id')
      .notNull()
      .references(() => order.id, { onDelete: 'cascade' }),
    productVariantId: text('product_variant_id').references(() => productVariant.id, {
      onDelete: 'set null',
    }),
    // 商品/規格名稱與售價快照，避免商品之後改名改價影響歷史訂單
    productName: text('product_name').notNull(),
    variantName: text('variant_name').notNull(),
    unitPrice: integer('unit_price').notNull(),
    quantity: integer('quantity').notNull(),
    subtotal: integer('subtotal').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('orderItem_orderId_idx').on(table.orderId)],
);

// 型別
export type Product = InferSelectModel<typeof product>;
