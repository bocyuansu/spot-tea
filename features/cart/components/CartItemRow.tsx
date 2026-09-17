'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Leaf, Trash2 } from 'lucide-react';
import QuantityStepper from '@/components/common/QuantityStepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { CartItem } from '@/features/cart/schemas/cart';
import { formatPriceTWD } from '@/lib/format';

type CartItemRowProps = {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export default function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  return (
    <Card size="sm">
      <CardContent className="flex gap-3">
        <Link
          href={`/product/${item.productSlug}`}
          className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
        >
          {item.image ? (
            <Image
              src={item.image}
              alt={item.productName}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
              <Leaf className="size-6" />
            </div>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col">
              <Link
                href={`/product/${item.productSlug}`}
                className="truncate font-medium hover:text-primary"
              >
                {item.productName}
              </Link>
              <span className="text-xs text-muted-foreground">規格：{item.variantLabel}</span>
              <span className="text-xs text-muted-foreground">
                單價：{formatPriceTWD(item.price)}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`移除 ${item.productName}`}
              onClick={onRemove}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <QuantityStepper value={item.quantity} max={item.stock} onChange={onQuantityChange} />
            <span className="font-semibold text-primary">
              {formatPriceTWD(item.price * item.quantity)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
