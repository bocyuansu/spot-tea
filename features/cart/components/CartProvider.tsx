'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CART_STORAGE_KEY,
  addCartItem,
  applyLatestPrices,
  getCartCount,
  getCartSubtotal,
  readStoredCart,
  removeCartItem,
  updateCartItemQuantity,
  writeStoredCart,
} from '@/features/cart/cart-utils';
import type { CartItem } from '@/features/cart/schemas/cart';

type CartContextValue = {
  items: CartItem[];
  isHydrated: boolean;
  totalQuantity: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  updatePrices: (latestPrices: Record<string, number>) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    writeStoredCart(items);
  }, [items, isHydrated]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== CART_STORAGE_KEY) return;
      setItems(readStoredCart());
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => addCartItem(prev, item));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((prev) => updateCartItemQuantity(prev, variantId, quantity));
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => removeCartItem(prev, variantId));
  }, []);

  const updatePrices = useCallback((latestPrices: Record<string, number>) => {
    setItems((prev) => applyLatestPrices(prev, latestPrices));
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
      updatePrices,
      clearCart,
    }),
    [
      items,
      isHydrated,
      addItem,
      updateQuantity,
      removeItem,
      updatePrices,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart 必須在 CartProvider 內使用');
  }

  return context;
}
