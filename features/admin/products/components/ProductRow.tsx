'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronRight, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { productStatusLabels } from '@/features/products/product-status';
import { formatPriceTWD } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AdminProduct } from '@/db/queries/admin/products';
import ProductMenu from '@/features/admin/products/components/ProductMenu';
import Link from 'next/link';

function formatPriceRange(variants: AdminProduct['variants']) {
  if (variants.length === 0) return '—';

  const prices = variants.map((variant) => variant.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return minPrice === maxPrice
    ? formatPriceTWD(minPrice)
    : `${formatPriceTWD(minPrice)} – ${formatPriceTWD(maxPrice)}`;
}

// 沒有 label 的規格就用淨重當顯示名稱，和前台的規則一致
function variantName(variant: AdminProduct['variants'][number]) {
  return variant.label || `${variant.weightGrams}g`;
}

type ProductRowProps = {
  product: AdminProduct;
  // 展開的規格矩陣要橫跨整個表格
  columnCount: number;
};

export default function ProductRow({ product, columnCount }: ProductRowProps) {
  const [expanded, setExpanded] = useState(false);

  const productImgUrl = product.images?.[0] ?? null;
  const totalStock = product.variants.reduce((total, variant) => total + variant.stock, 0);
  const hasVariants = product.variants.length > 0;

  return (
    <>
      <TableRow>
        <TableCell>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!hasVariants}
            aria-expanded={expanded}
            aria-label={`${expanded ? '收合' : '展開'} ${product.name} 的規格`}
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronRight className={cn('size-4 transition-transform', expanded && 'rotate-90')} />
          </Button>
        </TableCell>

        <TableCell>
          {productImgUrl ? (
            <Link href={productImgUrl} prefetch={false}>
              <Image
                src={product.images?.[0] ?? ''}
                alt={product.name}
                width={40}
                height={40}
                className="size-10 rounded-md object-cover ring-1 ring-foreground/10"
              />
            </Link>
          ) : (
            <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground/50">
              <Leaf className="size-4" />
            </div>
          )}
        </TableCell>

        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">{product.name}</span>
            <span className="text-xs text-muted-foreground">{product.slug}</span>
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {product.category?.name ?? '未分類'}
        </TableCell>
        <TableCell>
          <Badge variant={product.status === 'published' ? 'default' : 'outline'}>
            {productStatusLabels[product.status]}
          </Badge>
        </TableCell>
        <TableCell className="text-right text-muted-foreground">
          {product.variants.length}
        </TableCell>
        <TableCell className="text-right">{formatPriceRange(product.variants)}</TableCell>
        <TableCell className={totalStock === 0 ? 'text-right text-destructive' : 'text-right'}>
          {totalStock}
        </TableCell>
        <TableCell>
          <ProductMenu productId={product.id} productName={product.name} />
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={columnCount} className="bg-muted/30 p-0">
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
                {product.variants.map((variant) => (
                  <TableRow key={variant.id} className="border-0 hover:bg-transparent">
                    <TableCell className="pl-14 font-medium">{variantName(variant)}</TableCell>
                    <TableCell className="text-muted-foreground">{variant.weightGrams}g</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {variant.sku}
                    </TableCell>
                    <TableCell className="text-right">{formatPriceTWD(variant.price)}</TableCell>
                    <TableCell
                      className={cn('pr-6 text-right', variant.stock === 0 && 'text-destructive')}
                    >
                      {variant.stock === 0 ? '售完' : variant.stock}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
