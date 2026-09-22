'use client';

import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ShippingPaymentDetails from '@/components/common/ShippingPaymentDetails';
import type { OrderWithItems } from '@/db/queries/orders';
import { formatPriceTWD } from '@/lib/format';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from 'lucide-react';

type OrderCardProps = {
  order: OrderWithItems;
  // 卡片底部的操作列，原樣放在最後面，排版與要不要顯示由傳入的元件決定（見 OrderActions）
  action?: ReactNode;
};

export default function OrderCard({ order, action }: OrderCardProps) {
  return (
    <Card className="[--card-spacing:--spacing(2)]">
      <CardContent>
        <Collapsible className="rounded-md">
          <CollapsibleTrigger
            render={
              <Button
                variant="secondary"
                className="text-base w-full bg-background hover:bg-background"
              >
                訂單編號：{order.orderNumber}
                <ChevronDownIcon className="ml-auto group-data-panel-open/button:rotate-180" />
              </Button>
            }
          />
          <CollapsibleContent className="flex flex-col items-start gap-3 p-2.5 pt-0 text-sm">
            <Separator />

            <ShippingPaymentDetails order={order} />

            <Separator />

            <ul className="w-full flex flex-col gap-2">
              {order.items.map((item) => (
                <li key={item.id} className="w-full flex justify-between gap-3 text-sm">
                  <div className="flex flex-col w-full">
                    <span className="truncate">{item.productName}</span>
                    <span>規格：{item.variantName}</span>
                    <span>單價：{formatPriceTWD(item.unitPrice)}</span>
                    <div className="flex gap-4">
                      <span>數量：{item.quantity}</span>
                      <span className="ml-auto">{formatPriceTWD(item.subtotal)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Separator />

            <div className="ml-auto space-y-2">
              <div className="flex gap-2 justify-between">
                <span>小計</span>
                <span>{formatPriceTWD(order.subtotalAmount)}</span>
              </div>
              <div className="flex gap-2 justify-between">
                <span>運費</span>
                <span>{formatPriceTWD(order.shippingFee)}</span>
              </div>
            </div>

            <Separator />

            <div className="ml-auto flex gap-2 justify-between">
              <span>總計</span>
              <span>{formatPriceTWD(order.totalAmount)}</span>
            </div>

            {action}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
