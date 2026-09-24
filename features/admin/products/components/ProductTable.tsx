'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useTable } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminProduct } from '@/db/queries/admin/products';
import ProductBatchActions from '@/features/admin/products/components/ProductBatchActions';
import ProductVariantTable from '@/features/admin/products/components/ProductVariantTable';
import {
  columns,
  features,
} from '@/features/admin/products/product-table-columns';
import { productTablePaginationAtom } from '@/features/admin/products/product-table-pagination';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

type ProductTableProps = {
  products: AdminProduct[];
};

export default function ProductTable({ products }: ProductTableProps) {
  const table = useTable({
    features,
    columns,
    data: products,
    // row.id 預設是陣列索引；改用商品 id 當 React key，刪除商品後其他列的元件狀態才不會錯位
    getRowId: (product) => product.id,
    getRowCanExpand: (row) => row.original.variants.length > 0,
    atoms: {
      pagination: productTablePaginationAtom,
    },
    // 資料更新（例如批次上下架後重新整理）時停在原本那一頁；
    // 會讓列表長度改變的新增與刪除，由它們自己把頁碼歸零
    autoResetPageIndex: false,
  });

  const selectedProductIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id);

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
      <CardHeader className="border-b">
        <ProductBatchActions
          productIds={selectedProductIds}
          onSuccess={() => table.resetRowSelection()}
        />
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={header.column.columnDef.meta?.className}
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
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

      <CardFooter className="flex-wrap justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">每頁筆數</p>
          <Select
            value={table.state.pagination.pageSize}
            onValueChange={(pageSize) => {
              if (pageSize !== null) table.setPageSize(pageSize);
            }}
          >
            <SelectTrigger size="sm" className="w-18" aria-label="每頁筆數">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZE_OPTIONS.map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-6">
          <p className="text-sm font-medium">
            第 {table.state.pagination.pageIndex + 1} / {table.getPageCount()}{' '}
            頁
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="hidden lg:flex"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">第一頁</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">上一頁</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">下一頁</span>
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden lg:flex"
              onClick={() => table.lastPage()}
              disabled={!table.getCanLastPage()}
            >
              <span className="sr-only">最後一頁</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
