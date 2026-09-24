'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useHeaderContext } from '@/features/admin/shared/admin-table';

// 已排序的欄位顯示方向箭頭，並用 aria-sort 告訴螢幕報讀器；
// 還沒排序的欄位用淡色的雙向箭頭，提示標題可以點
const sortIndicators = {
  asc: { icon: ArrowUp, ariaSort: 'ascending' },
  desc: { icon: ArrowDown, ariaSort: 'descending' },
} as const;

// 可以排序的欄位把標題做成按鈕；不能排序的（勾選、操作等）只顯示標題
export default function SortableTableHead() {
  const header = useHeaderContext();
  const sortDirection = header.column.getIsSorted();
  const sortIndicator = sortDirection
    ? sortIndicators[sortDirection]
    : undefined;
  const SortIcon = sortIndicator?.icon ?? ArrowUpDown;

  return (
    <TableHead
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
            header.table.firstPage();
          }}
        >
          <header.FlexRender />
          <SortIcon className={cn(!sortDirection && 'text-muted-foreground')} />
        </Button>
      ) : (
        <header.FlexRender />
      )}
    </TableHead>
  );
}
