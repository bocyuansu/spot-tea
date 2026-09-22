import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { listAdminProducts } from '@/db/queries/admin/products';
import ProductTable from '@/features/admin/products/components/ProductTable';
import { getAdminUser } from '@/features/admin/shared/admin-guard';

export const metadata: Metadata = {
  title: '商品管理',
};

export default async function AdminProductsPage() {
  // layout 已經顯示 AccessDenied；這裡擋的是 RSC payload 裡的頁面資料
  if (!(await getAdminUser())) return null;

  const products = await listAdminProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl">商品管理</h1>
          <p className="mt-1 text-muted-foreground">
            共 {products.length} 項商品（含草稿與已下架）
          </p>
        </div>

        <Link
          href="/admin/products/create"
          prefetch={false}
          className={buttonVariants()}
        >
          <Plus className="size-4" />
          <span>新增商品</span>
        </Link>
      </div>

      <ProductTable products={products} />
    </div>
  );
}
