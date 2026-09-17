import { cartItemsSchema, type CartItem } from './schemas/cart';

export const CART_STORAGE_KEY = 'spot-tea-cart';

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
  const target = items.find((cartItem) => cartItem.variantId === variantId);

  // 結果不會改變時回傳原陣列，讓 CartProvider 的 memo 與 localStorage 寫入整段跳過
  if (!target) return items;

  const nextQuantity = clampQuantity(quantity, target.stock);

  if (nextQuantity === target.quantity) return items;

  return items
    .map((cartItem) =>
      cartItem.variantId === variantId ? { ...cartItem, quantity: nextQuantity } : cartItem,
    )
    .filter((cartItem) => cartItem.quantity > 0);
}

export function removeCartItem(items: CartItem[], variantId: string): CartItem[] {
  // 同上：購物車裡沒有這個規格時不製造新陣列
  if (!items.some((cartItem) => cartItem.variantId === variantId)) return items;

  return items.filter((cartItem) => cartItem.variantId !== variantId);
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((total, cartItem) => total + cartItem.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((total, cartItem) => total + cartItem.price * cartItem.quantity, 0);
}

// localStorage 的內容可能被竄改或是舊版格式，一律驗證後才放行
export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];

  try {
    const parsed = cartItemsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    // 資料損毀時，以空購物車繼續
    return [];
  }
}

export function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    return parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    // 無痕模式或瀏覽器設定擋掉 localStorage 時忽略
    return [];
  }
}

export function writeStoredCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 無痕模式或容量不足時忽略寫入失敗
  }
}
