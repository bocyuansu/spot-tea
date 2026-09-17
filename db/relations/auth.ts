import { defineRelationsPart } from 'drizzle-orm';

import * as authSchema from '@/db/schema/auth';
import * as cartSchema from '@/db/schema/cart';
import * as orderSchema from '@/db/schema/order';

// cart 與 order 只是 user 關聯的對向表格，本檔不負責定義它們自己的關聯
const schema = { ...authSchema, ...cartSchema, ...orderSchema };

export const authRelations = defineRelationsPart(schema, (r) => ({
  user: {
    sessions: r.many.session({
      from: r.user.id,
      to: r.session.userId,
    }),
    accounts: r.many.account({
      from: r.user.id,
      to: r.account.userId,
    }),
    // cart.userId 有 unique 限制，所以是一對一
    cart: r.one.cart({
      from: r.user.id,
      to: r.cart.userId,
    }),
    orders: r.many.order({
      from: r.user.id,
      to: r.order.userId,
    }),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  // verification 沒有任何關聯，但 Better Auth 的 drizzle adapter 是走 db.query[model]，
  // 沒被 defineRelationsPart 收錄的表格不會出現在 db.query 上，所以要留一個空物件
  verification: {},
}));
