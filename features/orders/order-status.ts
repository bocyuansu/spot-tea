import type { order } from '@/db/schema';

type Order = typeof order.$inferSelect;

export const orderStatusLabels: Record<Order['status'], string> = {
  pending_payment: '待付款',
  paid: '已付款',
  processing: '處理中',
  shipped: '已出貨',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

export const paymentStatusLabels: Record<Order['paymentStatus'], string> = {
  unpaid: '未付款',
  paid: '已付款',
  failed: '付款失敗',
  refunded: '已退款',
};

// 目前只收貨到付款與 ATM 匯款，兩者都不經過金流串接，訂單一律以未付款成立
export const paymentMethods = ['cod', 'bank_transfer'] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cod: '貨到付款',
  bank_transfer: 'ATM 匯款',
};

export const paymentMethodDescriptions: Record<PaymentMethod, string> = {
  cod: '商品送達時直接付款給物流人員',
  bank_transfer: '訂單成立後，客服會與您聯繫匯款資訊',
};

// paymentProvider 是自由文字欄位，seed 資料裡還留著 'ecpay'，查不到就原樣顯示
export function getPaymentMethodLabel(provider: string | null) {
  if (!provider) return '—';

  return paymentMethodLabels[provider as PaymentMethod] ?? provider;
}
