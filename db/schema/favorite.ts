import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { product } from './product';

/**
 * 會員收藏的商品。收藏的是商品本身而不是某個規格，挑規格留到商品頁再決定。
 *
 * 以 (userId, productId) 當複合主鍵：同一個商品重複收藏會被資料庫擋下，
 * 查「某會員的收藏」與「某會員是否收藏了這個商品」也都走得到這個索引。
 * 收藏不是財務紀錄，會員或商品刪除時跟著刪掉即可。
 */
export const favorite = pgTable(
  'favorite',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => product.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.productId] })],
);
