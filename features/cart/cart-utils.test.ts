import { describe, expect, it } from "vitest";
import {
  addCartItem,
  clampQuantity,
  getCartCount,
  getCartSubtotal,
  removeCartItem,
  updateCartItemQuantity,
} from "./cart-utils";
import type { CartItem } from "./schemas/cart";

function createItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    variantId: "var-1",
    productId: "prod-1",
    productName: "凍頂烏龍茶",
    productSlug: "dong-ding-oolong",
    variantLabel: "150g",
    image: null,
    price: 680,
    stock: 20,
    quantity: 1,
    ...overrides,
  };
}

describe("clampQuantity", () => {
  it("keeps the quantity between 1 and the stock", () => {
    expect(clampQuantity(0, 10)).toBe(1);
    expect(clampQuantity(5, 10)).toBe(5);
    expect(clampQuantity(20, 10)).toBe(10);
  });

  it("returns 0 when the variant is sold out", () => {
    expect(clampQuantity(3, 0)).toBe(0);
  });
});

describe("addCartItem", () => {
  it("appends a new variant", () => {
    const items = addCartItem([], createItem({ quantity: 2 }));

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it("merges the quantity of an existing variant", () => {
    const items = addCartItem([createItem({ quantity: 2 })], createItem({ quantity: 3 }));

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(5);
  });

  it("does not merge different variants of the same product", () => {
    const items = addCartItem([createItem()], createItem({ variantId: "var-2" }));

    expect(items).toHaveLength(2);
  });

  it("caps the merged quantity at the stock", () => {
    const items = addCartItem(
      [createItem({ quantity: 4, stock: 5 })],
      createItem({ quantity: 4, stock: 5 }),
    );

    expect(items[0].quantity).toBe(5);
  });
});

describe("updateCartItemQuantity", () => {
  it("caps the quantity at the stock", () => {
    const items = updateCartItemQuantity([createItem({ stock: 3 })], "var-1", 99);

    expect(items[0].quantity).toBe(3);
  });

  it("removes the item when the variant is sold out", () => {
    const items = updateCartItemQuantity([createItem({ stock: 0 })], "var-1", 1);

    expect(items).toHaveLength(0);
  });
});

describe("removeCartItem", () => {
  it("removes only the matching variant", () => {
    const items = removeCartItem([createItem(), createItem({ variantId: "var-2" })], "var-1");

    expect(items).toHaveLength(1);
    expect(items[0].variantId).toBe("var-2");
  });
});

describe("cart totals", () => {
  it("sums the quantity and the subtotal", () => {
    const items = [
      createItem({ quantity: 2, price: 680 }),
      createItem({ variantId: "var-2", quantity: 1, price: 2280 }),
    ];

    expect(getCartCount(items)).toBe(3);
    expect(getCartSubtotal(items)).toBe(3640);
  });
});
