"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import {
  CART_STORAGE_KEY,
  addCartItem,
  getCartCount,
  getCartSubtotal,
  removeCartItem,
  updateCartItemQuantity,
} from "@/features/cart/cart-utils";
import type { CartItem } from "@/features/cart/schemas/cart";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type CartContextValue = {
  items: CartItem[];
  isHydrated: boolean;
  totalQuantity: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems, isHydrated] = useLocalStorage<CartItem[]>(
    CART_STORAGE_KEY,
    [],
  );

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => addCartItem(prev, item));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((prev) => updateCartItemQuantity(prev, variantId, quantity));
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => removeCartItem(prev, variantId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isHydrated,
      totalQuantity: getCartCount(items),
      subtotal: getCartSubtotal(items),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, isHydrated, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart 必須在 CartProvider 內使用");
  }

  return context;
}
