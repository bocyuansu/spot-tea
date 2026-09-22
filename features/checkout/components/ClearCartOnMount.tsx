'use client';

import { useEffect } from 'react';
import { useCart } from '@/features/cart/components/CartProvider';

const CLEARED_ORDER_KEY = 'spot-tea-cleared-order';

/**
 * 訂單成立後才清購物車。
 *
 * 放在結帳表單的成功回呼裡會在導頁完成前就改動購物車狀態，CheckoutView 會先重繪成
 * 空購物車，使用者每次結帳都會看到一瞬間的「購物車還是空的」。改在完成頁清就沒有這個閃動。
 */
export default function ClearCartOnMount({
  orderNumber,
}: {
  orderNumber: string;
}) {
  const { clearCart } = useCart();

  useEffect(() => {
    try {
      // 同一張訂單只清一次：使用者可能逛一圈再按上一頁回到這頁，那時的新購物車不該被清掉
      if (window.sessionStorage.getItem(CLEARED_ORDER_KEY) === orderNumber)
        return;
      window.sessionStorage.setItem(CLEARED_ORDER_KEY, orderNumber);
    } catch {
      // 無痕模式擋掉 sessionStorage 時就每次都清，行為仍然正確
    }

    clearCart();
  }, [orderNumber, clearCart]);

  return null;
}
