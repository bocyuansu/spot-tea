'use client';

import { Fragment, type ReactNode } from 'react';
import type { RowData } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTableContext } from '@/features/admin/shared/admin-table';

type TableContentProps<TData extends RowData> = {
  // 有資料但搜尋不到任何一筆時顯示的提示
  emptyMessage: string;
  // 展開某一列時，在它下方多顯示的內容；列表不能展開就不用傳
  renderExpandedRow?: (rowData: TData) => ReactNode;
};

// 表頭用可排序的標題，儲存格依欄位的 meta.className 對齊
export default function TableContent<TData extends RowData>({
  emptyMessage,
  renderExpandedRow,
}: TableContentProps<TData>) {
  const table = useTableContext<TData>();
  const rows = table.getRowModel().rows;

  return (
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
        {rows.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={table.getAllLeafColumns().length}
              className="h-24 text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
        {rows.map((row) => (
          <Fragment key={row.id}>
            <TableRow data-state={row.getIsSelected() ? 'selected' : undefined}>
              {row.getAllCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cell.column.columnDef.meta?.className}
                >
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>

            {/* 展開的內容是額外的一列，用單一儲存格橫跨整個表格 */}
            {renderExpandedRow && row.getIsExpanded() && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={row.getAllCells().length}
                  className="bg-muted/30 p-0"
                >
                  {renderExpandedRow(row.original)}
                </TableCell>
              </TableRow>
            )}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
