import type { Metadata } from 'next';
import { listAdminProducts } from '@/db/queries/admin';
import AdminProductTable from '@/features/admin/components/AdminProductTable';

export const metadata: Metadata = {
  title: '商品管理',
};

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">商品管理</h1>
        <p className="mt-1 text-muted-foreground">共 {products.length} 項商品（含草稿與已下架）</p>
      </div>

      <AdminProductTable products={products} />
    </div>
  );
}
