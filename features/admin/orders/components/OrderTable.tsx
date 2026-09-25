'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import type { AdminOrder } from '@/db/queries/admin/orders';
import { columns } from '@/features/admin/orders/order-table-columns';
import { orderTableState } from '@/features/admin/orders/order-table-state';
import { useAppTable } from '@/features/admin/shared/admin-table';

type OrderTableProps = {
  orders: AdminOrder[];
};

export default function OrderTable({ orders }: OrderTableProps) {
  const table = useAppTable({
    columns,
    data: orders,
    atoms: orderTableState.atoms,
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
          <table.TableContent emptyMessage="沒有符合搜尋條件的訂單" />
        </CardContent>

        <CardFooter>
          <table.TablePagination />
        </CardFooter>
      </Card>
    </table.AppTable>
  );
}
