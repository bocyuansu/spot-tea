'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconDotsVertical } from '@tabler/icons-react';
import { Pencil, Trash2 } from 'lucide-react';
import ProductDeleteDialog from '@/features/admin/products/components/ProductDeleteDialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductMenu({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);

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
          <DropdownMenuItem
            variant="destructive"
            aria-label={`刪除 ${productName}`}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" /> 刪除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ProductDeleteDialog
        productId={productId}
        productName={productName}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
