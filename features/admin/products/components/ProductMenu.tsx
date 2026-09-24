'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconDotsVertical } from '@tabler/icons-react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// 刪除改成勾選後在列表上方批次刪除，見 ProductBatchActions
export default function ProductMenu({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-25">
          <DropdownMenuItem
            aria-label={`編輯 ${productName}`}
            render={
              <Link href={`/admin/products/${productId}`} prefetch={false} />
            }
          >
            <Pencil className="size-4" /> 編輯
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
