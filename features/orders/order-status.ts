import type { order } from '@/db/schema';

type Order = typeof order.$inferSelect;
type OrderStatus = Order['status'];
type PaymentStatus = Order['paymentStatus'];

// 訂單狀態只講貨與流程，不講錢
export const orderStatusLabels: Record<Order['status'], string> = {
  pending: '待處理',
  processing: '備貨中',
  shipped: '已出貨',
  completed: '已完成',
  cancelled: '已取消',
};

// 錢的部分全部集中在付款狀態，退款也算在這裡
export const paymentStatusLabels: Record<Order['paymentStatus'], string> = {
  unpaid: '未付款',
  paid: '已付款',
  failed: '付款失敗',
  refunded: '已退款',
};

/**
 * 後台只能用按鈕把狀態往下一步推，不能任意改回去，這兩張表就是全部的規則。
 * 取消只在出貨前；出貨後的退貨一律在付款狀態上標記退款。
 * 目標型別排除了起點（待處理、未付款、付款失敗），型別上就不可能有一步走回去。
 */
export const orderStatusTransitions: Record<OrderStatus, Exclude<OrderStatus, 'pending'>[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['completed'],
  completed: [],
  cancelled: [],
};

// 綠界不會把訂單寫成 failed（見 features/payments/ecpay-result.ts），failed 只會是舊資料，
// 一樣可以在確認收到款項後補記已付款
export const paymentStatusTransitions: Record<
  PaymentStatus,
  Exclude<PaymentStatus, 'unpaid' | 'failed'>[]
> = {
  unpaid: ['paid'],
  failed: ['paid'],
  paid: ['refunded'],
  refunded: [],
};

// 反查哪些狀態可以走到 next；server 端把它當成 UPDATE 的條件
export function getPreviousStatuses<S extends string>(
  transitions: Record<S, readonly S[]>,
  next: S,
): S[] {
  return (Object.keys(transitions) as S[]).filter((from) => transitions[from].includes(next));
}

// 信用卡與 ATM 匯款要先收到錢才能開始備貨；貨到付款本來就是送達時才收錢。
// paymentProvider 是自由文字，沒填或不認得的一律當成要先付款
export function isAwaitingPrepayment(order: Pick<Order, 'paymentProvider' | 'paymentStatus'>) {
  return order.paymentProvider !== 'cod' && order.paymentStatus !== 'paid';
}

// 訂單取消了錢卻已經進來，例如顧客停在綠界付款頁時訂單被取消、之後才付款成功。
// 把錢記成已付款是對的，但後台要看得出這筆還欠顧客一次退款
export function isAwaitingRefund(order: Pick<Order, 'status' | 'paymentStatus'>) {
  return order.status === 'cancelled' && order.paymentStatus === 'paid';
}

// 訂單一律以未付款成立。貨到付款與 ATM 匯款由後台手動確認；
// ecpay 是綠界信用卡，付款結果由綠界的通知回寫（見 features/payments）
export const paymentMethods = ['ecpay', 'cod', 'bank_transfer'] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  ecpay: '信用卡付款',
  cod: '貨到付款',
  bank_transfer: 'ATM 匯款',
};

export const paymentMethodDescriptions: Record<PaymentMethod, string> = {
  ecpay: '訂單成立後前往綠界科技付款頁刷卡',
  cod: '商品送達時直接付款給物流人員',
  bank_transfer: '訂單成立後，客服會與您聯繫匯款資訊',
};

// paymentProvider 是自由文字欄位，舊資料可能存著不在清單裡的值，查不到就原樣顯示
export function getPaymentMethodLabel(provider: string | null) {
  if (!provider) return '—';

  return paymentMethodLabels[provider as PaymentMethod] ?? provider;
}

// 兩張後台表格（訂單列表與儀表板的最新訂單）共用同一組 Badge 樣式，避免兩邊各寫一份而走鐘
type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

export const orderStatusVariants: Record<Order['status'], BadgeVariant> = {
  pending: 'secondary',
  processing: 'secondary',
  shipped: 'secondary',
  completed: 'default',
  cancelled: 'destructive',
};

export const paymentStatusVariants: Record<Order['paymentStatus'], BadgeVariant> = {
  unpaid: 'outline',
  paid: 'default',
  failed: 'destructive',
  refunded: 'destructive',
};

// 綠界信用卡訂單還沒付款（付款失敗或中途離開也仍是 unpaid），可以再前往綠界重付
export function isAwaitingEcpayPayment(
  order: Pick<Order, 'paymentProvider' | 'paymentStatus' | 'status'>,
) {
  return (
    order.paymentProvider === 'ecpay' &&
    order.paymentStatus === 'unpaid' &&
    order.status !== 'cancelled'
  );
}
