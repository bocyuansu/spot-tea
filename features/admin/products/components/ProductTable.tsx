'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useTable } from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
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
import { cn } from '@/lib/utils';
import type { AdminProduct } from '@/db/queries/admin/products';
import ProductBatchActions from '@/features/admin/products/components/ProductBatchActions';
import ProductTableSearch from '@/features/admin/products/components/ProductTableSearch';
import ProductVariantTable from '@/features/admin/products/components/ProductVariantTable';
import {
  columns,
  features,
} from '@/features/admin/products/product-table-columns';
import {
  productTableGlobalFilterAtom,
  productTablePaginationAtom,
  productTableSortingAtom,
} from '@/features/admin/products/product-table-state';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

// 已排序的欄位顯示方向箭頭，並用 aria-sort 告訴螢幕報讀器；
// 還沒排序的欄位用淡色的雙向箭頭，提示標題可以點
const sortIndicators = {
  asc: { icon: ArrowUp, ariaSort: 'ascending' },
  desc: { icon: ArrowDown, ariaSort: 'descending' },
} as const;

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
      sorting: productTableSortingAtom,
      globalFilter: productTableGlobalFilterAtom,
    },
    globalFilterFn: 'includesKeyword',
    // 一次只依一欄排序：標題上的箭頭看不出多欄排序的先後
    enableMultiSort: false,
    // 資料更新（例如批次上下架後重新整理）時停在原本那一頁；
    // 會讓列表長度改變的新增與刪除，以及搜尋和排序，由它們自己把頁碼歸零
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ProductTableSearch
            value={table.state.globalFilter}
            onChange={(value) => {
              table.setGlobalFilter(value);
              // 結果筆數變了，原本那一頁可能已經不存在，回到第一頁
              table.firstPage();
            }}
          />

          <ProductBatchActions
            productIds={selectedProductIds}
            onSuccess={() => table.resetRowSelection()}
          />
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortDirection = header.column.getIsSorted();
                  const sortIndicator = sortDirection
                    ? sortIndicators[sortDirection]
                    : undefined;
                  const SortIcon = sortIndicator?.icon ?? ArrowUpDown;

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      aria-sort={sortIndicator?.ariaSort}
                      className={header.column.columnDef.meta?.className}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        // 負邊距抵銷按鈕內距，標題文字才會和下方內容對齊（左、中、右對齊都適用）
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-mx-2.5 text-sm"
                          onClick={(event) => {
                            header.column.getToggleSortingHandler()?.(event);
                            // 換了排序，原本那一頁的內容就不一樣了，回到第一頁
                            table.firstPage();
                          }}
                        >
                          <table.FlexRender header={header} />
                          <SortIcon
                            className={cn(
                              !sortDirection && 'text-muted-foreground',
                            )}
                          />
                        </Button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
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
          {/* 搜尋沒有結果時仍算一頁，頁碼顯示才不會出現「第 1 / 0 頁」 */}
          <p className="text-sm font-medium">
            第 {table.state.pagination.pageIndex + 1} /{' '}
            {Math.max(1, table.getPageCount())} 頁
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
