'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminProduct } from '@/db/queries/admin/products';
import ProductBatchActions from '@/features/admin/products/components/ProductBatchActions';
import ProductVariantTable from '@/features/admin/products/components/ProductVariantTable';
import { columns } from '@/features/admin/products/product-table-columns';
import {
  productTableGlobalFilterAtom,
  productTablePaginationAtom,
  productTableSortingAtom,
} from '@/features/admin/products/product-table-state';
import { useAppTable } from '@/features/admin/shared/admin-table';

type ProductTableProps = {
  products: AdminProduct[];
};

export default function ProductTable({ products }: ProductTableProps) {
  const table = useAppTable({
    columns,
    data: products,
    getRowCanExpand: (row) => row.original.variants.length > 0,
    atoms: {
      pagination: productTablePaginationAtom,
      sorting: productTableSortingAtom,
      globalFilter: productTableGlobalFilterAtom,
    },
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
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((h) => (
                    <table.AppHeader header={h} key={h.id}>
                      {(header) => <header.SortableTableHead />}
                    </table.AppHeader>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={table.getAllLeafColumns().length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    沒有符合搜尋條件的商品
                  </TableCell>
                </TableRow>
              )}
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                  >
                    {row.getAllCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.className}
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* 展開的規格矩陣是額外的一列，用單一儲存格橫跨整個表格 */}
                  {row.getIsExpanded() && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={row.getAllCells().length}
                        className="bg-muted/30 p-0"
                      >
                        <ProductVariantTable variants={row.original.variants} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter>
          <table.TablePagination />
        </CardFooter>
      </Card>
    </table.AppTable>
  );
}
