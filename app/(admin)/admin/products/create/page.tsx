import type { Metadata } from 'next';
import { listAdminCategories } from '@/db/queries/admin/products';
import ProductForm from '@/features/admin/products/components/ProductForm';
import { getAdminUser } from '@/features/admin/shared/admin-guard';

export const metadata: Metadata = {
  title: '新增商品',
};

export default async function AdminProductCreatePage() {
  // layout 已經顯示 AccessDenied；這裡擋的是 RSC payload 裡的頁面資料
  if (!(await getAdminUser())) return null;

  const categories = await listAdminCategories();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">新增商品</h1>
        <p className="mt-1 text-muted-foreground">建立商品資料與至少一個規格</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
