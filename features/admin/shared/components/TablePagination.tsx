'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTableContext } from '@/features/admin/shared/admin-table';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

export default function TablePagination() {
  const table = useTableContext();

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-4">
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
    </div>
  );
}
