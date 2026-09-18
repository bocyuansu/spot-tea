import CartItemRow from './CartItemRow';
import { useCart } from './CartProvider';

export default function CartList() {
  const { items, updateQuantity, removeItem } = useCart();

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.variantId}>
          <CartItemRow
            item={item}
            onQuantityChange={(quantity) => updateQuantity(item.variantId, quantity)}
            onRemove={() => removeItem(item.variantId)}
          />
        </li>
      ))}
    </ul>
  );
}
