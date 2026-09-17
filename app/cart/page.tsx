import type { Metadata } from "next";
import CartView from "@/features/cart/components/CartView";

export const metadata: Metadata = {
  title: "購物車",
  description: "找茶 購物車",
};

export default function CartPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">購物車</h1>
        <p className="mt-1 text-muted-foreground">確認您挑選的好茶，準備結帳</p>
      </div>

      <CartView />
    </div>
  );
}
