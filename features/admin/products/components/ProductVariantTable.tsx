import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPriceTWD } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AdminProduct } from '@/db/queries/admin/products';

// 沒有 label 的規格就用淨重當顯示名稱，和前台的規則一致
function variantName(variant: AdminProduct['variants'][number]) {
  return variant.label || `${variant.weightGrams}g`;
}

type ProductVariantTableProps = {
  variants: AdminProduct['variants'];
};

// ProductTable 展開某項商品時顯示的規格矩陣
export default function ProductVariantTable({
  variants,
}: ProductVariantTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-14">規格</TableHead>
          <TableHead>淨重</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead className="text-right">價格</TableHead>
          <TableHead className="pr-6 text-right">庫存</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variants.map((variant) => (
          <TableRow key={variant.id} className="border-0 hover:bg-transparent">
            <TableCell className="pl-14 font-medium">
              {variantName(variant)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {variant.weightGrams}g
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {variant.sku}
            </TableCell>
            <TableCell className="text-right">
              {formatPriceTWD(variant.price)}
            </TableCell>
            <TableCell
              className={cn(
                'pr-6 text-right',
                variant.stock === 0 && 'text-destructive',
              )}
            >
              {variant.stock === 0 ? '售完' : variant.stock}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
