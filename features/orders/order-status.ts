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
