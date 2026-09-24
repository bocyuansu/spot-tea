'use client';

import type { AdminCategoryWithCount } from '@/db/queries/admin/categories';
import CategoryDeleteDialog from '@/features/admin/categories/components/CategoryDeleteDialog';

type CategoryBatchActionsProps = {
  categories: AdminCategoryWithCount[];
  // 刪除成功後清掉勾選，免得下一次批次操作又帶到同一批分類
  onSuccess: () => void;
};

// 版面與商品列表的 ProductBatchActions 一致，分類目前只有批次刪除
export default function CategoryBatchActions({
  categories,
  onSuccess,
}: CategoryBatchActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">
        {categories.length > 0 && `已選取 ${categories.length} 個分類`}
      </p>

      <div className="flex gap-2">
        <CategoryDeleteDialog categories={categories} onSuccess={onSuccess} />
      </div>
    </div>
  );
}
