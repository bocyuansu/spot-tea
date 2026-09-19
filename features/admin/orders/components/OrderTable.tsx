import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getPaymentMethodLabel,
  orderStatusLabels,
  paymentStatusLabels,
} from '@/features/orders/order-status';
import { formatDateTW, formatPriceTWD } from '@/lib/format';
import OrderMenu from '@/features/admin/orders/components/OrderMenu';
import type { AdminOrder } from '@/db/queries/admin/orders';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

const statusVariants: Record<AdminOrder['status'], BadgeVariant> = {
  pending_payment: 'secondary',
  paid: 'default',
  processing: 'secondary',
  shipped: 'secondary',
  completed: 'default',
  cancelled: 'destructive',
  refunded: 'destructive',
};

const paymentStatusVariants: Record<AdminOrder['paymentStatus'], BadgeVariant> = {
  unpaid: 'outline',
  paid: 'default',
  failed: 'destructive',
  refunded: 'destructive',
};

type OrderTableProps = {
  orders: AdminOrder[];
};

export default function OrderTable({ orders }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <p>資料庫裡還沒有任何訂單</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>訂單編號</TableHead>
              <TableHead>會員</TableHead>
              <TableHead>訂單狀態</TableHead>
              <TableHead>付款狀態</TableHead>
              <TableHead>付款方式</TableHead>
              <TableHead>下單日期</TableHead>
              <TableHead className="text-right">金額</TableHead>
              <TableHead className="text-right">操作</TableHead>
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
                  <Badge variant={statusVariants[order.status]}>
                    {orderStatusLabels[order.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={paymentStatusVariants[order.paymentStatus]}>
                    {paymentStatusLabels[order.paymentStatus]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getPaymentMethodLabel(order.paymentProvider)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTW(order.createdAt)}
                </TableCell>
                <TableCell className="text-right font-medium text-primary">
                  {formatPriceTWD(order.totalAmount)}
                </TableCell>
                <TableCell>
                  <OrderMenu
                    orderId={order.id}
                    orderNumber={order.orderNumber}
                    status={order.status}
                    paymentStatus={order.paymentStatus}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
