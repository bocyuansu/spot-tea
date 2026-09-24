'use client';

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
import type { AdminOrder } from '@/db/queries/admin/orders';
import { columns } from '@/features/admin/orders/order-table-columns';
import {
  orderTableGlobalFilterAtom,
  orderTablePaginationAtom,
  orderTableSortingAtom,
} from '@/features/admin/orders/order-table-state';
import { useAppTable } from '@/features/admin/shared/admin-table';

type OrderTableProps = {
  orders: AdminOrder[];
};

export default function OrderTable({ orders }: OrderTableProps) {
  const table = useAppTable({
    columns,
    data: orders,
    atoms: {
      pagination: orderTablePaginationAtom,
      sorting: orderTableSortingAtom,
      globalFilter: orderTableGlobalFilterAtom,
    },
  });

  if (orders.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <p>資料庫裡還沒有任何訂單</p>
      </div>
    );
  }

  return (
    <table.AppTable>
      <Card>
        <CardHeader className="border-b">
          <table.TableSearch
            placeholder="搜尋訂單編號、會員名稱或 Email"
            label="搜尋訂單"
          />
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
                    沒有符合搜尋條件的訂單
                  </TableCell>
                </TableRow>
              )}
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
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
