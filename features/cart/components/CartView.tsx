"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import CartItemRow from "@/features/cart/components/CartItemRow";
import CartSummary from "@/features/cart/components/CartSummary";
import { useCart } from "@/features/cart/components/CartProvider";

export default function CartView() {
  const {
    items,
    isHydrated,
    totalQuantity,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (!isHydrated) {
    return <p className="text-muted-foreground">購物車載入中…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Leaf className="size-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          購物車還是空的，來挑一款好茶吧！
        </p>
        <Link href="/products" className={buttonVariants({ size: "lg" })}>
          去逛逛商品
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
      {/* Cart List */}
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.variantId}>
            <CartItemRow
              item={item}
              onQuantityChange={(quantity) =>
                updateQuantity(item.variantId, quantity)
              }
              onRemove={() => removeItem(item.variantId)}
            />
          </li>
        ))}
      </ul>

      <CartSummary
        totalQuantity={totalQuantity}
        subtotal={subtotal}
        onClear={clearCart}
      />
    </div>
  );
}
