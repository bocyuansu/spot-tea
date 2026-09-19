import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LOW_STOCK_THRESHOLD, type AdminOverview } from '@/db/queries/admin/overview';

type LowStockProps = {
  variants: AdminOverview['lowStockVariants'];
};

export default function LowStock({ variants }: LowStockProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>補貨提醒</CardTitle>
        <CardDescription>庫存低於 {LOW_STOCK_THRESHOLD} 件的規格</CardDescription>
      </CardHeader>
      <CardContent>
        {variants.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">所有規格庫存都很充足</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {variants.map((variant) => (
              <li key={variant.id} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{variant.product.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {variant.label ?? `${variant.weightGrams}g`}．{variant.sku}
                  </span>
                </div>
                <span
                  className={
                    variant.stock === 0 ? 'shrink-0 text-destructive' : 'shrink-0 text-primary'
                  }
                >
                  {variant.stock === 0 ? '已售完' : `剩 ${variant.stock} 件`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
