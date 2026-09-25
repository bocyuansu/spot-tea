'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import type { AdminCategoryWithCount } from '@/db/queries/admin/categories';
import CategoryBatchActions from '@/features/admin/categories/components/CategoryBatchActions';
import { columns } from '@/features/admin/categories/category-table-columns';
import { categoryTableState } from '@/features/admin/categories/category-table-state';
import { useAppTable } from '@/features/admin/shared/admin-table';

type CategoryTableProps = {
  categories: AdminCategoryWithCount[];
};

export default function CategoryTable({ categories }: CategoryTableProps) {
  const table = useAppTable({
    columns,
    data: categories,
    atoms: categoryTableState.atoms,
  });

  const selectedCategories = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  if (categories.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <p>目前還沒有任何分類</p>
        <p className="text-sm">建立分類之後，就能在商品表單裡指定分類</p>
      </div>
    );
  }

  return (
    <table.AppTable>
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 分類搜尋 */}
            <table.TableSearch
              placeholder="搜尋分類名稱或網址代稱"
              label="搜尋分類"
            />
            {/* 批次操作 */}
            <CategoryBatchActions
              categories={selectedCategories}
              onSuccess={() => table.resetRowSelection()}
            />
          </div>
        </CardHeader>

        <CardContent>
          <table.TableContent emptyMessage="沒有符合搜尋條件的分類" />
        </CardContent>

        <CardFooter>
          <table.TablePagination />
        </CardFooter>
      </Card>
    </table.AppTable>
  );
}
