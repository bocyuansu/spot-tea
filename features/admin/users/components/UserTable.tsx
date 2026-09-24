'use client';

import { useMemo } from 'react';
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
import type { AdminUser } from '@/db/queries/admin/users';
import { useAppTable } from '@/features/admin/shared/admin-table';
import { createUserColumns } from '@/features/admin/users/user-table-columns';
import {
  userTableGlobalFilterAtom,
  userTablePaginationAtom,
  userTableSortingAtom,
} from '@/features/admin/users/user-table-state';

type UserTableProps = {
  users: AdminUser[];
  // 交給 UserActions 用來擋住「停權自己」這件事
  currentUserId: string;
};

export default function UserTable({ users, currentUserId }: UserTableProps) {
  // 欄位換了新的參考，表格就會重建所有欄位，所以只在 currentUserId 變了才重建
  const columns = useMemo(
    () => createUserColumns(currentUserId),
    [currentUserId],
  );

  const table = useAppTable({
    columns,
    data: users,
    atoms: {
      pagination: userTablePaginationAtom,
      sorting: userTableSortingAtom,
      globalFilter: userTableGlobalFilterAtom,
    },
  });

  if (users.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <p>目前還沒有任何會員</p>
      </div>
    );
  }

  return (
    <table.AppTable>
      <Card>
        <CardHeader className="border-b">
          <table.TableSearch
            placeholder="搜尋會員名稱或 Email"
            label="搜尋會員"
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
                    沒有符合搜尋條件的會員
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
