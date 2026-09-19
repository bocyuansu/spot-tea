'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/features/cart/components/CartProvider';

export default function CartBadge() {
  const { totalQuantity, isHydrated } = useCart();

  return (
    <Link
      href="/cart"
      className="relative hover:text-primary"
      aria-label={`購物車，${totalQuantity} 件商品`}
    >
      <ShoppingCart className="size-6" />
      {isHydrated && totalQuantity > 0 && (
        <div className="absolute bg-primary text-white size-4 rounded-full -top-2 -right-2 flex justify-center items-center text-xs">
          {totalQuantity > 99 ? '99+' : totalQuantity}
        </div>
      )}
    </Link>
  );
}
