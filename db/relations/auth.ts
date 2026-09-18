import { defineRelationsPart } from 'drizzle-orm';

import * as schema from '@/db/schema';

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
      optional: false,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
      optional: false,
    }),
  },
}));
