import { describe, expect, it } from 'vitest';
import {
  addCartItem,
  applyLatestPrices,
  clampQuantity,
  getCartCount,
  getCartSubtotal,
  parseStoredCart,
  removeCartItem,
  updateCartItemQuantity,
} from './cart-utils';
import type { CartItem } from './schemas/cart';

function createItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    variantId: 'var-1',
    productId: 'prod-1',
    productName: '凍頂烏龍茶',
    productSlug: 'dong-ding-oolong',
    variantLabel: '150g',
    image: null,
    price: 680,
    stock: 20,
    quantity: 1,
    ...overrides,
  };
}

describe('clampQuantity', () => {
  it('keeps the quantity between 1 and the stock', () => {
    expect(clampQuantity(0, 10)).toBe(1);
    expect(clampQuantity(5, 10)).toBe(5);
    expect(clampQuantity(20, 10)).toBe(10);
  });

  it('returns 0 when the variant is sold out', () => {
    expect(clampQuantity(3, 0)).toBe(0);
  });
});

describe('addCartItem', () => {
  it('appends a new variant', () => {
    const items = addCartItem([], createItem({ quantity: 2 }));

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('merges the quantity of an existing variant', () => {
    const items = addCartItem(
      [createItem({ quantity: 2 })],
      createItem({ quantity: 3 }),
    );

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(5);
  });

  it('does not merge different variants of the same product', () => {
    const items = addCartItem(
      [createItem()],
      createItem({ variantId: 'var-2' }),
    );

    expect(items).toHaveLength(2);
  });

  it('caps the merged quantity at the stock', () => {
    const items = addCartItem(
      [createItem({ quantity: 4, stock: 5 })],
      createItem({ quantity: 4, stock: 5 }),
    );

    expect(items[0].quantity).toBe(5);
  });
});

describe('updateCartItemQuantity', () => {
  it('caps the quantity at the stock', () => {
    const items = updateCartItemQuantity(
      [createItem({ stock: 3 })],
      'var-1',
      99,
    );

    expect(items[0].quantity).toBe(3);
  });

  it('removes the item when the variant is sold out', () => {
    const items = updateCartItemQuantity(
      [createItem({ stock: 0 })],
      'var-1',
      1,
    );

    expect(items).toHaveLength(0);
  });

  // CartProvider 靠同一個陣列跳過 memo 與 localStorage 寫入
  it('returns the same array when nothing changes', () => {
    const items = [createItem({ quantity: 3, stock: 3 })];

    expect(updateCartItemQuantity(items, 'var-2', 5)).toBe(items);
    expect(updateCartItemQuantity(items, 'var-1', 99)).toBe(items);
  });
});

describe('removeCartItem', () => {
  it('removes only the matching variant', () => {
    const items = removeCartItem(
      [createItem(), createItem({ variantId: 'var-2' })],
      'var-1',
    );

    expect(items).toHaveLength(1);
    expect(items[0].variantId).toBe('var-2');
  });

  it('returns the same array when the variant is not in the cart', () => {
    const items = [createItem()];

    expect(removeCartItem(items, 'var-2')).toBe(items);
  });
});

describe('applyLatestPrices', () => {
  it('replaces the stored price with the latest one', () => {
    const items = applyLatestPrices(
      [
        createItem({ price: 680 }),
        createItem({ variantId: 'var-2', price: 2280 }),
      ],
      { 'var-1': 720 },
    );

    expect(items[0].price).toBe(720);
    expect(items[1].price).toBe(2280);
  });

  it('keeps an unchanged item as the same object', () => {
    const item = createItem({ price: 680 });

    expect(applyLatestPrices([item], { 'var-1': 680 })[0]).toBe(item);
  });
});

describe('parseStoredCart', () => {
  it('returns an empty cart when nothing is stored', () => {
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart('')).toEqual([]);
  });

  it('returns an empty cart when the stored value is not valid JSON', () => {
    expect(parseStoredCart('{')).toEqual([]);
    expect(parseStoredCart('not json')).toEqual([]);
  });

  it('returns an empty cart when the stored value is not an array', () => {
    expect(parseStoredCart('{}')).toEqual([]);
    expect(parseStoredCart('42')).toEqual([]);
  });

  it('rejects the whole cart when an item has been tampered with', () => {
    const missingField = JSON.stringify([{ variantId: 'var-1' }]);
    const wrongType = JSON.stringify([
      createItem({ price: 'abc' as unknown as number }),
    ]);
    const invalidQuantity = JSON.stringify([createItem({ quantity: 0 })]);

    expect(parseStoredCart(missingField)).toEqual([]);
    expect(parseStoredCart(wrongType)).toEqual([]);
    expect(parseStoredCart(invalidQuantity)).toEqual([]);
  });

  it('returns the items when the stored cart is valid', () => {
    const items = [
      createItem(),
      createItem({ variantId: 'var-2', quantity: 3 }),
    ];

    expect(parseStoredCart(JSON.stringify(items))).toEqual(items);
  });
});

describe('cart totals', () => {
  it('sums the quantity and the subtotal', () => {
    const items = [
      createItem({ quantity: 2, price: 680 }),
      createItem({ variantId: 'var-2', quantity: 1, price: 2280 }),
    ];

    expect(getCartCount(items)).toBe(3);
    expect(getCartSubtotal(items)).toBe(3640);
  });
});
