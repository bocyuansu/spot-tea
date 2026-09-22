import type { Metadata } from 'next';
import { listAdminCategoriesWithCounts } from '@/db/queries/admin/categories';
import CategoryCreateDialog from '@/features/admin/categories/components/CategoryCreateDialog';
import CategoryTable from '@/features/admin/categories/components/CategoryTable';
import { getAdminUser } from '@/features/admin/shared/admin-guard';

export const metadata: Metadata = {
  title: '商品分類',
};

export default async function AdminCategoriesPage() {
  // layout 已經顯示 AccessDenied；這裡擋的是 RSC payload 裡的頁面資料
  if (!(await getAdminUser())) return null;

  const categories = await listAdminCategoriesWithCounts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl">商品分類</h1>
          <p className="mt-1 text-muted-foreground">
            共 {categories.length} 個分類
          </p>
        </div>

        <CategoryCreateDialog />
      </div>

      <CategoryTable categories={categories} />
    </div>
  );
}
