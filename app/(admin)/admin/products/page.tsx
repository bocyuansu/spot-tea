import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listAdminProducts } from '@/db/queries/admin/products';
import ProductTable from '@/features/admin/products/components/ProductTable';

export const metadata: Metadata = {
  title: '商品管理',
};

export default async function AdminProductsPage() {
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

        <Button render={<Link href="/admin/products/new" />} nativeButton={false}>
          <Plus className="size-4" />
          <span>新增商品</span>
        </Button>
      </div>

      <ProductTable products={products} />
    </div>
  );
}
