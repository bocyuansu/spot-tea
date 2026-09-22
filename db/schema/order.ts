import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  index,
  integer,
  jsonb,
  pgEnum,
  check,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { productVariant } from './product';

// 訂單狀態只描述「貨與流程」走到哪裡，錢的部分一律看 paymentStatus，
// 兩者互不重複：已出貨但還沒收到貨款，就是 shipped + unpaid。
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'shipped',
  'completed',
  'cancelled',
]);

// 付款狀態只描述「錢」的去向，包含退款
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
    status: orderStatusEnum('status').default('pending').notNull(),
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
    // 顧客在「我的訂單」自行取消時填的原因；後台取消的與沒被取消的訂單都是 null
    cancelReason: text('cancel_reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    // 最後一次更新這筆訂單的管理員，和 updatedAt 描述的是同一次變更；
    // 顧客下單、顧客自行取消、綠界付款通知這類不是管理員做的變更一律寫 null。
    // 跟 userId 一樣不設 onDelete：更新過訂單的管理員請改用停權，不要刪除帳號
    updatedById: text('updated_by_id').references(() => user.id),
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

/**
 * 訂單的每一次狀態變更。order.updatedById 只留得住最後一次，這裡保留完整歷程。
 *
 * 只記「變成什麼」，前一個狀態就是上一筆事件。每筆事件只會改訂單狀態或付款狀態其中之一，
 * 用各自的 enum 欄位存，資料庫就會擋掉不存在的狀態值。
 * 下單本身不寫事件，order.createdAt 已經記下了。
 */
export const orderEvent = pgTable(
  'order_event',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text('order_id')
      .notNull()
      .references(() => order.id, { onDelete: 'cascade' }),
    status: orderStatusEnum('status'),
    paymentStatus: paymentStatusEnum('payment_status'),
    // 做這次變更的管理員；綠界付款通知與顧客自行取消寫 null，規則與 order.updatedById 相同，也不設 onDelete
    actorId: text('actor_id').references(() => user.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('orderEvent_orderId_idx').on(table.orderId),
    check('order_event_one_change', sql`num_nonnulls(${table.status}, ${table.paymentStatus}) = 1`),
  ],
);
