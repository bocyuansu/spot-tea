import type { Metadata } from 'next';
import { listAdminCategories } from '@/db/queries/admin';
import AdminProductForm from '@/features/admin/components/AdminProductForm';

export const metadata: Metadata = {
  title: '新增商品',
};

export default async function AdminProductCreatePage() {
  const categories = await listAdminCategories();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">新增商品</h1>
        <p className="mt-1 text-muted-foreground">建立商品資料與至少一個規格</p>
      </div>

      <AdminProductForm categories={categories} />
    </div>
  );
}
