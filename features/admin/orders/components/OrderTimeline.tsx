import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orderStatusLabels, paymentStatusLabels } from '@/features/orders/order-status';
import { formatDateTimeTW } from '@/lib/format';
import type { AdminOrderDetail } from '@/db/queries/admin/orders';

type OrderEvent = AdminOrderDetail['events'][number];

type OrderTimelineProps = {
  order: AdminOrderDetail;
};

// 每筆事件只會有 status 或 paymentStatus 其中一個（資料庫的 check 限制保證）
function describeEvent(event: OrderEvent) {
  if (event.status) return `訂單狀態改為${orderStatusLabels[event.status]}`;
  if (event.paymentStatus) return `付款狀態改為${paymentStatusLabels[event.paymentStatus]}`;
  return '狀態變更';
}

// 沒有 actor 的事件只會是綠界付款通知自動入帳
function describeActor(event: OrderEvent) {
  return event.actor ? event.actor.name : '綠界自動入帳';
}

/**
 * 訂單異動歷程。下單本身沒有寫事件，第一列直接用 createdAt；
 * 歷程表上線前就改過狀態的舊訂單，只看得到這一列。
 */
export default function OrderTimeline({ order }: OrderTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>異動歷程</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col gap-3 text-sm">
          <li className="flex flex-col gap-0.5">
            <span>訂單成立</span>
            <span className="text-xs text-muted-foreground">
              {formatDateTimeTW(order.createdAt)}・{order.user.name}
            </span>
          </li>
          {order.events.map((event) => (
            <li key={event.id} className="flex flex-col gap-0.5">
              <span>{describeEvent(event)}</span>
              <span className="text-xs text-muted-foreground">
                {formatDateTimeTW(event.createdAt)}・{describeActor(event)}
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
