import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import type { AdminProduct } from '@/db/queries/admin/products';
import ProductMenu from '@/features/admin/products/components/ProductMenu';

const statusVariants: Record<AdminProduct['status'], 'default' | 'secondary' | 'outline'> = {
  published: 'default',
  draft: 'secondary',
  archived: 'outline',
};

function formatPriceRange(variants: AdminProduct['variants']) {
  if (variants.length === 0) return '—';

  const prices = variants.map((variant) => variant.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return minPrice === maxPrice
    ? formatPriceTWD(minPrice)
    : `${formatPriceTWD(minPrice)} – ${formatPriceTWD(maxPrice)}`;
}

type ProductTableProps = {
  products: AdminProduct[];
};

export default function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <p>資料庫裡還沒有任何商品</p>
        <Button render={<Link href="/admin/products/new" />} nativeButton={false}>
          新增第一項商品
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>商品</TableHead>
              <TableHead>分類</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="text-right">規格</TableHead>
              <TableHead className="text-right">價格</TableHead>
              <TableHead className="text-right">總庫存</TableHead>
              <TableHead className="w-24 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const totalStock = product.variants.reduce(
                (total, variant) => total + variant.stock,
                0,
              );

              return (
                <TableRow key={product.id}>
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
                  <TableCell
                    className={totalStock === 0 ? 'text-right text-destructive' : 'text-right'}
                  >
                    {totalStock}
                  </TableCell>
                  <TableCell>
                    <ProductMenu productId={product.id} productName={product.name} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
