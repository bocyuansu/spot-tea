"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { formatPriceTWD } from "@/lib/format";
import type { ProductWithDetails } from "@/db/queries/products";

type Variant = ProductWithDetails["variants"][number];

type ProductPurchasePanelProps = {
  productName: string;
  variants: Variant[];
};

function getVariantLabel(variant: Variant) {
  return variant.label ?? `${variant.weightGrams}g`;
}

export default function ProductPurchasePanel({
  productName,
  variants,
}: ProductPurchasePanelProps) {
  const firstAvailable =
    variants.find((variant) => variant.stock > 0) ?? variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(
    firstAvailable?.id,
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId),
    [variants, selectedVariantId],
  );

  const isSoldOut = !selectedVariant || selectedVariant.stock <= 0;

  if (variants.length === 0) {
    return <p className="text-muted-foreground">此商品目前無可購買規格</p>;
  }

  const handleSelectVariant = (variant: Variant) => {
    setSelectedVariantId(variant.id);
    setQuantity(1);
  };

  const handleQuantityChange = (delta: number) => {
    if (!selectedVariant) return;
    setQuantity((prev) =>
      Math.min(Math.max(prev + delta, 1), selectedVariant.stock),
    );
  };

  const handleAddToCart = () => {
    if (!selectedVariant || isSoldOut) return;

    toast.add({
      type: "success",
      title: "已加入購物車",
      description: `${productName}．${getVariantLabel(selectedVariant)} × ${quantity}`,
    });
  };

  return (
    <div className="flex flex-col gap-4 border-t pt-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">規格</span>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const soldOut = variant.stock <= 0;
            const selected = variant.id === selectedVariantId;

            return (
              <button
                key={variant.id}
                type="button"
                disabled={soldOut}
                onClick={() => handleSelectVariant(variant)}
                className={cn(
                  "flex flex-col items-start rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted",
                  soldOut && "cursor-not-allowed opacity-50",
                )}
              >
                <span className="font-medium">
                  {getVariantLabel(variant)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatPriceTWD(variant.price)}
                  {soldOut && "．已售完"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">數量</span>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={isSoldOut || quantity <= 1}
            onClick={() => handleQuantityChange(-1)}
          >
            <Minus className="size-3.5" />
          </Button>
          <span className="w-6 text-center text-sm">{quantity}</span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={
              isSoldOut ||
              !selectedVariant ||
              quantity >= selectedVariant.stock
            }
            onClick={() => handleQuantityChange(1)}
          >
            <Plus className="size-3.5" />
          </Button>
          {selectedVariant && !isSoldOut && (
            <span className="text-xs text-muted-foreground">
              庫存 {selectedVariant.stock} 件
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">小計</span>
        <span className="text-xl font-semibold text-primary">
          {formatPriceTWD((selectedVariant?.price ?? 0) * quantity)}
        </span>
      </div>

      <Button
        type="button"
        size="lg"
        disabled={isSoldOut}
        onClick={handleAddToCart}
        className="w-full gap-2"
      >
        <ShoppingCart className="size-4" />
        {isSoldOut ? "已售完" : "加入購物車"}
      </Button>
    </div>
  );
}
