'use client';

import Link from 'next/link';
import { IconDotsVertical } from '@tabler/icons-react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type OrderMenuProps = {
  orderId: string;
  orderNumber: string;
};

// 改變狀態的步驟都收不回來，只放在明細頁：那裡看得到付款方式與金額，按下去前也會先確認
export default function OrderMenu({ orderId, orderNumber }: OrderMenuProps) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            aria-label={`查看 ${orderNumber} 的明細`}
            render={<Link href={`/admin/orders/${orderId}`} prefetch={false} />}
          >
            <Eye className="size-4" /> 查看明細
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
