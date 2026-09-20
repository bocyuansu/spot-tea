import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  paymentMethodDescriptions,
  type PaymentMethod,
} from '@/features/orders/order-status';
import { formatPriceTWD } from '@/lib/format';
import type { AdminOrderDetail } from '@/db/queries/admin/orders';

type OrderDetailProps = {
  order: AdminOrderDetail;
};

export default function OrderDetail({ order }: OrderDetailProps) {
  const { recipientName, phone, postalCode, city, district, addressLine } = order.shippingAddress;
  // seed 資料的 paymentProvider 是 'ecpay'，查不到說明就不顯示那一行
  const paymentDescription = paymentMethodDescriptions[order.paymentProvider as PaymentMethod];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>商品明細</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品</TableHead>
                <TableHead>規格</TableHead>
                <TableHead className="text-right">單價</TableHead>
                <TableHead className="text-right">數量</TableHead>
                <TableHead className="text-right">小計</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className="text-muted-foreground">{item.variantName}</TableCell>
                  <TableCell className="text-right">{formatPriceTWD(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatPriceTWD(item.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>小計</span>
              <span>{formatPriceTWD(order.subtotalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>運費</span>
              <span>{order.shippingFee === 0 ? '免運' : formatPriceTWD(order.shippingFee)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>合計</span>
              <span className="font-semibold text-primary">
                {formatPriceTWD(order.totalAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>收件與付款資訊</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">收件人</span>
            <span>
              {recipientName}　{phone}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">收件地址</span>
            <span>
              {postalCode} {city}
              {district}
              {addressLine}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">付款方式</span>
            <span>{getPaymentMethodLabel(order.paymentProvider)}</span>
            {paymentDescription && (
              <span className="text-xs text-muted-foreground">{paymentDescription}</span>
            )}
          </div>
          {order.note && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">訂單備註</span>
              <span className="whitespace-pre-wrap">{order.note}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>下單會員</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{order.user.name}</span>
          <span className="text-muted-foreground">{order.user.email}</span>
        </CardContent>
      </Card>
    </div>
  );
}
