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
import { useState } from 'react';
import CategoryEditDialog from '@/features/admin/categories/components/CategoryEditDialog';
import type { AdminCategoryWithCount } from '@/db/queries/admin/categories';

// 表格「操作」欄：選單與編輯對話框共用同一列的分類資料；刪除改成勾選後批次刪除，見 CategoryBatchActions
export default function CategoryMenu({
  category,
}: {
  category: AdminCategoryWithCount;
}) {
  const [editOpen, setEditOpen] = useState(false);

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
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-4" /> 編輯
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CategoryEditDialog
        categoryId={category.id}
        categoryName={category.name}
        categorySlug={category.slug}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
