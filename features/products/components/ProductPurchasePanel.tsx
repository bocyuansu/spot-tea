'use client';

import { useId, useMemo, useState } from 'react';
import { ShoppingCartPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import QuantityStepper from '@/components/common/QuantityStepper';
import { toast } from '@/components/ui/toast';
import { formatPriceTWD } from '@/lib/format';
import { useCart } from '@/features/cart/components/CartProvider';
import type { ProductWithDetails } from '@/db/queries/products';

type Variant = ProductWithDetails['variants'][number];

type ProductPurchasePanelProps = {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  variants: Variant[];
};

function getVariantLabel(variant: Variant) {
  return variant.label ?? `${variant.weightGrams}g`;
}

export default function ProductPurchasePanel({
  productId,
  productName,
  productSlug,
  productImage,
  variants,
}: ProductPurchasePanelProps) {
  const { addItem } = useCart();
  // 尋找有存貨的商品規格
  const firstAvailable =
    variants.find((variant) => variant.stock > 0) ?? variants[0];
  // 選擇有存貨的商品規格 ID
  const [selectedVariantId, setSelectedVariantId] = useState(
    firstAvailable?.id,
  );
  // 購買數量
  const [quantity, setQuantity] = useState(1);
  const variantLabelId = useId();
  // 從 ID 找出選中的商品規格
  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId),
    [variants, selectedVariantId],
  );
  // 判斷商品是否賣完
  const isSoldOut = !selectedVariant || selectedVariant.stock <= 0;
  // 沒有可以購買的規格
  if (variants.length === 0) {
    return <p className="text-muted-foreground">此商品目前無可購買規格</p>;
  }

  const handleSelectVariant = (variant: Variant) => {
    setSelectedVariantId(variant.id);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedVariant || isSoldOut) return;

    addItem({
      variantId: selectedVariant.id,
      productId,
      productName,
      productSlug,
      variantLabel: getVariantLabel(selectedVariant),
      image: productImage,
      price: selectedVariant.price,
      stock: selectedVariant.stock,
      quantity,
    });

    toast.add({
      type: 'success',
      title: '已加入購物車',
      description: `${productName}．${getVariantLabel(selectedVariant)} × ${quantity}`,
    });
  };

  return (
    <div className="flex flex-col gap-4 border-t pt-4">
      <div className="flex flex-col gap-2">
        <span id={variantLabelId} className="text-sm font-medium">
          規格
        </span>
        {/* 按鈕名稱直接用畫面上的重量與價格，選中狀態用 aria-pressed 告訴螢幕閱讀器 */}
        <div
          role="group"
          aria-labelledby={variantLabelId}
          className="flex flex-wrap gap-2"
        >
          {variants.map((variant) => {
            const soldOut = variant.stock <= 0;
            const selected = variant.id === selectedVariantId;

            return (
              <button
                key={variant.id}
                type="button"
                aria-pressed={selected}
                disabled={soldOut}
                onClick={() => handleSelectVariant(variant)}
                className={cn(
                  'flex flex-col items-start rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                  selected
                    ? 'border-primary-strong bg-primary/10'
                    : 'border-border hover:bg-muted',
                  soldOut && 'cursor-not-allowed opacity-50',
                )}
              >
                <span className="font-medium">{getVariantLabel(variant)}</span>
                <span className="text-xs text-muted-foreground">
                  {formatPriceTWD(variant.price)}
                  {soldOut && '．已售完'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">數量</span>
        <div className="flex items-center gap-3">
          <QuantityStepper
            value={quantity}
            max={selectedVariant?.stock ?? 1}
            disabled={isSoldOut}
            onChange={setQuantity}
          />
          {selectedVariant && !isSoldOut && (
            <span className="text-xs text-muted-foreground">
              庫存 {selectedVariant.stock} 件
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">小計</span>
        <span className="text-xl font-semibold text-primary-strong">
          {formatPriceTWD((selectedVariant?.price ?? 0) * quantity)}
        </span>
      </div>

      <Button
        type="button"
        size="lg"
        disabled={isSoldOut}
        onClick={handleAddToCart}
        className="h-11 w-full gap-2 text-base"
      >
        <ShoppingCartPlus className="size-4" />
        {isSoldOut ? '已售完' : '加入購物車'}
      </Button>
    </div>
  );
}
