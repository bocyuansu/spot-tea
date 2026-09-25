import { TableCell, TableHead, TableRow } from '@/components/ui/table';
import { formatPriceTWD } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AdminProduct } from '@/db/queries/admin/products';

// 沒有 label 的規格就用淨重當顯示名稱，和前台的規則一致
function variantName(variant: AdminProduct['variants'][number]) {
  return variant.label || `${variant.weightGrams}g`;
}

// 展開區塊的底色，hover 時維持不變
const expandedRowClassName = 'bg-muted/30 hover:bg-muted/30';

type ProductVariantRowsProps = {
  variants: AdminProduct['variants'];
};

// ProductTable 展開某項商品時，接在商品列下方的規格列
// 儲存格順序對應 product-table-columns.tsx：前三欄（勾選、展開、圖片）和最後的操作欄留空，
// 規格、淨重、SKU、價格、庫存依序對齊商品、分類、狀態、價格、總庫存，調整欄位順序時要一起改
export default function ProductVariantRows({
  variants,
}: ProductVariantRowsProps) {
  return (
    <>
      <TableRow className={cn(expandedRowClassName, 'border-0')}>
        <TableCell colSpan={3} />
        <TableHead scope="col" className="h-8 text-xs text-muted-foreground">
          規格
        </TableHead>
        <TableHead scope="col" className="h-8 text-xs text-muted-foreground">
          淨重
        </TableHead>
        <TableHead
          scope="col"
          className="h-8 text-center text-xs text-muted-foreground"
        >
          SKU
        </TableHead>
        <TableHead
          scope="col"
          className="h-8 text-right text-xs text-muted-foreground"
        >
          價格
        </TableHead>
        <TableHead
          scope="col"
          className="h-8 text-right text-xs text-muted-foreground"
        >
          庫存
        </TableHead>
        <TableCell />
      </TableRow>

      {/* 只有最後一個規格保留底線，和下一項商品分開 */}
      {variants.map((variant, index) => (
        <TableRow
          key={variant.id}
          className={cn(
            expandedRowClassName,
            index < variants.length - 1 && 'border-0',
          )}
        >
          <TableCell colSpan={3} />
          <TableCell className="font-medium">{variantName(variant)}</TableCell>
          <TableCell className="text-muted-foreground">
            {variant.weightGrams}g
          </TableCell>
          <TableCell className="text-center font-mono text-xs text-muted-foreground">
            {variant.sku}
          </TableCell>
          <TableCell className="text-right">
            {formatPriceTWD(variant.price)}
          </TableCell>
          <TableCell
            className={cn(
              'text-right',
              variant.stock === 0 && 'text-destructive',
            )}
          >
            {variant.stock === 0 ? '售完' : variant.stock}
          </TableCell>
          <TableCell />
        </TableRow>
      ))}
    </>
  );
}
