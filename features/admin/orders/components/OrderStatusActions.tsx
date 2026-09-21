'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  getPaymentMethodLabel,
  isAwaitingPrepayment,
  isAwaitingRefund,
  orderStatusLabels,
  orderStatusTransitions,
  orderStatusVariants,
  paymentStatusLabels,
  paymentStatusTransitions,
  paymentStatusVariants,
} from '@/features/orders/order-status';
import {
  transitionOrderStatus,
  transitionPaymentStatus,
} from '@/features/admin/orders/actions/orders';
import OrderStepButton from '@/features/admin/orders/components/OrderStepButton';
import { formatDateTimeTW, formatPriceTWD } from '@/lib/format';
import type { AdminOrderDetail } from '@/db/queries/admin/orders';

type OrderStatus = AdminOrderDetail['status'];
type PaymentStatus = AdminOrderDetail['paymentStatus'];

// 每個「下一步」按鈕的文案，key 是按下去之後的狀態
const orderStepLabels: Record<Exclude<OrderStatus, 'pending'>, string> = {
  processing: '開始備貨',
  shipped: '標記為已出貨',
  completed: '標記為已完成',
  cancelled: '取消訂單',
};

const paymentStepLabels: Record<Exclude<PaymentStatus, 'unpaid' | 'failed'>, string> = {
  paid: '標記為已付款',
  refunded: '標記為已退款',
};

const orderStepHints: Record<OrderStatus, string> = {
  pending: '確認訂單內容後開始備貨，出貨前都還可以取消',
  processing: '包裹寄出後標記為已出貨，出貨前都還可以取消',
  shipped: '顧客收到商品後標記為已完成',
  completed: '訂單已經完成，沒有下一步了',
  cancelled: '訂單已經取消，沒有下一步了',
};

const paymentStepHints: Record<PaymentStatus, string> = {
  unpaid:
    '信用卡通常由綠界自動入帳；貨到付款、ATM 匯款，或綠界要求人工確認的交易，收到款項後請手動標記',
  failed: '確認收到款項後請手動標記',
  paid: '退款請先在綠界後台或銀行完成，再回來標記',
  refunded: '款項已經退還，沒有下一步了',
};

type OrderStatusActionsProps = {
  order: AdminOrderDetail;
};

export default function OrderStatusActions({ order }: OrderStatusActionsProps) {
  const orderSteps = orderStatusTransitions[order.status];
  const paymentSteps = paymentStatusTransitions[order.paymentStatus];
  const awaitingPrepayment = isAwaitingPrepayment(order) && order.status === 'pending';

  return (
    <Card className="[--card-spacing:--spacing(6)]">
      <CardHeader>
        <CardTitle className="text-xl">訂單與付款狀態</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">訂單狀態</span>
            <Badge variant={orderStatusVariants[order.status]}>
              {orderStatusLabels[order.status]}
            </Badge>
          </div>
          {orderSteps.length > 0 && (
            <div className="grid gap-2">
              {orderSteps.map((next) => (
                <OrderStepButton
                  key={next}
                  label={orderStepLabels[next]}
                  disabled={next === 'processing' && awaitingPrepayment}
                  confirm={
                    next === 'cancelled'
                      ? {
                          title: `確定要取消 ${order.orderNumber} 嗎 ?`,
                          description:
                            '取消後無法復原，商品會自動補回庫存。已付款的訂單請另外完成退款，再標記為已退款。',
                          destructive: true,
                        }
                      : undefined
                  }
                  onRun={() => transitionOrderStatus(order.id, next)}
                />
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {awaitingPrepayment
              ? '信用卡與 ATM 匯款要先收到款項，才能開始備貨'
              : orderStepHints[order.status]}
          </p>
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">付款狀態</span>
            <Badge variant={paymentStatusVariants[order.paymentStatus]}>
              {paymentStatusLabels[order.paymentStatus]}
            </Badge>
          </div>
          {/* 到綠界後台查帳或退款時要用它找到這筆交易 */}
          {order.paymentTransactionId && (
            <p className="text-sm text-muted-foreground">
              綠界交易編號：{order.paymentTransactionId}
            </p>
          )}
          {paymentSteps.length > 0 && (
            <div className="grid gap-2">
              {paymentSteps.map((next) => (
                <OrderStepButton
                  key={next}
                  label={paymentStepLabels[next]}
                  confirm={
                    next === 'paid'
                      ? {
                          title: `確定要把 ${order.orderNumber} 標記為已付款嗎 ?`,
                          description: `請先確認已收到${getPaymentMethodLabel(order.paymentProvider)}的款項 ${formatPriceTWD(order.totalAmount)}。標記後無法復原，預付的訂單也會因此可以開始備貨。`,
                        }
                      : {
                          title: `確定要把 ${order.orderNumber} 標記為已退款嗎 ?`,
                          description:
                            '這裡只記錄結果，不會真的退款。請先在綠界後台或銀行完成退款；標記後無法復原。',
                          destructive: true,
                        }
                  }
                  onRun={() => transitionPaymentStatus(order.id, next)}
                />
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {isAwaitingRefund(order)
              ? '訂單已取消但已收到款項，請先在綠界後台或銀行完成退款，再標記為已退款'
              : paymentStepHints[order.paymentStatus]}
          </p>
        </section>

        {order.updatedBy && (
          <>
            <Separator />
            <p className="text-sm text-muted-foreground">
              最後由 {order.updatedBy.name} 於 {formatDateTimeTW(order.updatedAt)} 更新
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
