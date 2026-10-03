'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/features/cart/components/CartProvider';

export default function CartBadge() {
  const { totalQuantity, isHydrated } = useCart();

  return (
    <Link
      href="/cart"
      prefetch={false}
      // 手機版撐到 44px 觸控範圍，桌機版維持圖示大小
      className="flex size-11 items-center justify-center hover:text-primary-strong md:size-auto"
      aria-label={`購物車，${totalQuantity} 件商品`}
    >
      <span className="relative">
        <ShoppingCart className="size-6" />
        {isHydrated && totalQuantity > 0 && (
          <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">
            {totalQuantity > 99 ? '99+' : totalQuantity}
          </span>
        )}
      </span>
    </Link>
  );
}
