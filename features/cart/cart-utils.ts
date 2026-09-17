import { cartItemsSchema, type CartItem } from "./schemas/cart";

export const CART_STORAGE_KEY = "spot-tea-cart";

// 數量至少 1 件，且不得超過庫存；庫存為 0 時回傳 0，由呼叫端決定移除
export function clampQuantity(quantity: number, stock: number) {
  if (stock <= 0) return 0;
  return Math.min(Math.max(Math.trunc(quantity), 1), stock);
}

// 同規格重複加入時累加數量，並以最新的商品資訊覆寫快照
export function addCartItem(items: CartItem[], item: CartItem): CartItem[] {
  const existing = items.find((cartItem) => cartItem.variantId === item.variantId);

  if (!existing) {
    return [...items, { ...item, quantity: clampQuantity(item.quantity, item.stock) }];
  }

  return items.map((cartItem) =>
    cartItem.variantId === item.variantId
      ? {
          ...item,
          quantity: clampQuantity(existing.quantity + item.quantity, item.stock),
        }
      : cartItem,
  );
}

export function updateCartItemQuantity(
  items: CartItem[],
  variantId: string,
  quantity: number,
): CartItem[] {
  return items
    .map((cartItem) =>
      cartItem.variantId === variantId
        ? { ...cartItem, quantity: clampQuantity(quantity, cartItem.stock) }
        : cartItem,
    )
    .filter((cartItem) => cartItem.quantity > 0);
}

export function removeCartItem(items: CartItem[], variantId: string): CartItem[] {
  return items.filter((cartItem) => cartItem.variantId !== variantId);
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((total, cartItem) => total + cartItem.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((total, cartItem) => total + cartItem.price * cartItem.quantity, 0);
}

export function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = cartItemsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    // 資料損毀或無法存取 localStorage 時，以空購物車繼續
    return [];
  }
}

export function writeStoredCart(items: CartItem[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 無痕模式或容量不足時忽略寫入失敗
  }
}
