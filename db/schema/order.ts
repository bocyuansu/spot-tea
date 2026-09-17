import { pgTable, text, timestamp, index, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { productVariant } from './product';

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
