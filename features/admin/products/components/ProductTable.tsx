import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminProduct } from '@/db/queries/admin/products';
import ProductRow from '@/features/admin/products/components/ProductRow';

// 展開的規格矩陣要用 colSpan 橫跨整列，欄數改了這裡也要跟著改
const COLUMN_COUNT = 9;

type ProductTableProps = {
  products: AdminProduct[];
};

export default function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <p>資料庫裡還沒有任何商品</p>
        <Link href="/admin/products/create" className={buttonVariants()}>
          新增第一項商品
        </Link>
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <span className="sr-only">展開規格</span>
              </TableHead>
              <TableHead className="w-16">圖片</TableHead>
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
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                columnCount={COLUMN_COUNT}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
