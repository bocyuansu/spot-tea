'use client';

import { useCallback } from 'react';
import CartItemRow from './CartItemRow';
import { useCart } from './CartProvider';

export default function CartList() {
  const { items, updateQuantity, removeItem } = useCart();

  const handleQuantityChange = useCallback(
    (variantId: string, quantity: number) => updateQuantity(variantId, quantity),
    [updateQuantity],
  );

  const handleRemove = useCallback((variantId: string) => removeItem(variantId), [removeItem]);

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.variantId}>
          <CartItemRow
            item={item}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
          />
        </li>
      ))}
    </ul>
  );
}
