'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IconDotsVertical } from '@tabler/icons-react';
import { BadgeCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toast';
import { updateOrderStatus } from '@/features/admin/orders/actions/orders';
import type { AdminOrder } from '@/db/queries/admin/orders';

type OrderMenuProps = {
  orderId: string;
  orderNumber: string;
  // 標記已付款只改付款狀態，訂單狀態原封不動帶回去
  status: AdminOrder['status'];
  paymentStatus: AdminOrder['paymentStatus'];
};

export default function OrderMenu({ orderId, orderNumber, status, paymentStatus }: OrderMenuProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function onMarkAsPaid() {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, { status, paymentStatus: 'paid' });

      if (!result.ok) {
        toast.add({ type: 'error', description: result.message, priority: 'high' });
        return;
      }

      setOpen(false);
      toast.add({ type: 'success', description: '已標記為已付款 !' });
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-32">
          <DropdownMenuItem
            aria-label={`查看 ${orderNumber} 的明細`}
            render={<Link href={`/admin/orders/${orderId}`} />}
          >
            <Eye className="size-4" /> 查看明細
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={`把 ${orderNumber} 標記為已付款`}
            disabled={paymentStatus === 'paid' || isPending}
            onClick={onMarkAsPaid}
          >
            <BadgeCheck className="size-4" /> 標記為已付款
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
