// 運費規則：購物車頁、結帳頁與建單的 server action 三邊共用，才不會各算一套
export const FREE_SHIPPING_THRESHOLD = 1500;
export const SHIPPING_FEE = 120;

export function calculateShippingFee(subtotal: number) {
  // 空購物車不該顯示運費
  if (subtotal <= 0) return 0;

  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

// 還差多少才免運，用在購物車頁的提示；已達門檻回 0
export function getAmountToFreeShipping(subtotal: number) {
  return Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
}
