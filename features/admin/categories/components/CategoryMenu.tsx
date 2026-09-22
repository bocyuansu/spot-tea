'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconDotsVertical } from '@tabler/icons-react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import CategoryDeleteDialog from '@/features/admin/categories/components/CategoryDeleteDialog';
import CategoryEditDialog from '@/features/admin/categories/components/CategoryEditDialog';
import type { AdminCategoryWithCount } from '@/db/queries/admin/categories';

// 表格「操作」欄：選單與兩個對話框共用同一列的分類資料
export default function CategoryMenu({
  category,
}: {
  category: AdminCategoryWithCount;
}) {
  // 同一列的兩個對話框一次只會開一個
  const [activeDialog, setActiveDialog] = useState<'edit' | 'delete' | null>(
    null,
  );

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-25">
          <DropdownMenuItem
            aria-label={`編輯 ${category.name}`}
            onClick={() => setActiveDialog('edit')}
          >
            <Pencil className="size-4" /> 編輯
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            aria-label={`刪除 ${category.name}`}
            onClick={() => setActiveDialog('delete')}
          >
            <Trash2 className="size-4" /> 刪除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CategoryEditDialog
        categoryId={category.id}
        categoryName={category.name}
        categorySlug={category.slug}
        open={activeDialog === 'edit'}
        onOpenChange={(open) => setActiveDialog(open ? 'edit' : null)}
      />
      <CategoryDeleteDialog
        categoryId={category.id}
        categoryName={category.name}
        productCount={category.productCount}
        open={activeDialog === 'delete'}
        onOpenChange={(open) => setActiveDialog(open ? 'delete' : null)}
      />
    </div>
  );
}
