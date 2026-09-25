'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import type { AdminProduct } from '@/db/queries/admin/products';
import ProductBatchActions from '@/features/admin/products/components/ProductBatchActions';
import ProductVariantRows from '@/features/admin/products/components/ProductVariantRows';
import { columns } from '@/features/admin/products/product-table-columns';
import { productTableState } from '@/features/admin/products/product-table-state';
import { useAppTable } from '@/features/admin/shared/admin-table';

type ProductTableProps = {
  products: AdminProduct[];
};

export default function ProductTable({ products }: ProductTableProps) {
  const table = useAppTable({
    columns,
    data: products,
    getRowCanExpand: (row) => row.original.variants.length > 0,
    atoms: productTableState.atoms,
  });

  const selectedProducts = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

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
    <table.AppTable>
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 商品搜尋 */}
            <table.TableSearch
              placeholder="搜尋商品名稱或分類"
              label="搜尋商品"
            />
            {/* 批次操作 */}
            <ProductBatchActions
              products={selectedProducts}
              onSuccess={() => table.resetRowSelection()}
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* 展開的商品在下方逐列列出規格，欄位對齊商品列 */}
          <table.TableContent
            emptyMessage="沒有符合搜尋條件的商品"
            renderExpandedRow={(product: AdminProduct) => (
              <ProductVariantRows variants={product.variants} />
            )}
          />
        </CardContent>

        <CardFooter>
          <table.TablePagination />
        </CardFooter>
      </Card>
    </table.AppTable>
  );
}
