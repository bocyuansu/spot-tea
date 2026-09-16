import { defineRelations } from 'drizzle-orm';
import * as authSchema from './auth';
import * as shopSchema from './shop';

// 展開匯入而非手動列舉表格，新增資料表時會自動被 defineRelations 收錄，不必回來維護這裡
const schema = { ...authSchema, ...shopSchema };

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),
    cart: r.one.cart(),
    orders: r.many.order(),
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
  category: {
    products: r.many.product(),
  },
  product: {
    category: r.one.category({
      from: r.product.categoryId,
      to: r.category.id,
    }),
    variants: r.many.productVariant(),
  },
  productVariant: {
    product: r.one.product({
      from: r.productVariant.productId,
      to: r.product.id,
    }),
    cartItems: r.many.cartItem(),
    orderItems: r.many.orderItem(),
  },
  cart: {
    user: r.one.user({
      from: r.cart.userId,
      to: r.user.id,
    }),
    items: r.many.cartItem(),
  },
  cartItem: {
    cart: r.one.cart({
      from: r.cartItem.cartId,
      to: r.cart.id,
    }),
    productVariant: r.one.productVariant({
      from: r.cartItem.productVariantId,
      to: r.productVariant.id,
    }),
  },
  order: {
    user: r.one.user({
      from: r.order.userId,
      to: r.user.id,
    }),
    items: r.many.orderItem(),
  },
  orderItem: {
    order: r.one.order({
      from: r.orderItem.orderId,
      to: r.order.id,
    }),
    productVariant: r.one.productVariant({
      from: r.orderItem.productVariantId,
      to: r.productVariant.id,
    }),
  },
}));
