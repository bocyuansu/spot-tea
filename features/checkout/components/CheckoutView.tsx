'use client';

import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useCart } from '@/features/cart/components/CartProvider';
import CheckoutForm from '@/features/checkout/components/CheckoutForm';

type CheckoutViewProps = {
  defaultRecipientName: string;
};

export default function CheckoutView({
  defaultRecipientName,
}: CheckoutViewProps) {
  const { items, isHydrated } = useCart();

  if (!isHydrated) {
    return <p className="text-muted-foreground">結帳資料載入中…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Leaf className="size-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          購物車還是空的，先挑一款好茶吧！
        </p>
        <Link href="/products" className={buttonVariants({ size: 'lg' })}>
          去逛逛商品
        </Link>
      </div>
    );
  }

  return <CheckoutForm defaultRecipientName={defaultRecipientName} />;
}
