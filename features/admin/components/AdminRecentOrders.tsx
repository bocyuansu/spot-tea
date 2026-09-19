import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { orderStatusLabels } from '@/features/orders/order-status';
import { formatDateTW, formatPriceTWD } from '@/lib/format';
import type { AdminOverview } from '@/db/queries/admin';

type AdminRecentOrdersProps = {
  orders: AdminOverview['recentOrders'];
};

export default function AdminRecentOrders({ orders }: AdminRecentOrdersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最新訂單</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">目前還沒有任何訂單</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>訂單編號</TableHead>
                <TableHead>會員</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>下單日期</TableHead>
                <TableHead className="text-right">金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{order.user.name}</span>
                      <span className="text-xs text-muted-foreground">{order.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{orderStatusLabels[order.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTW(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    {formatPriceTWD(order.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
