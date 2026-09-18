import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '商品管理',
};

export default function AdminProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">商品管理</h1>
        <p className="mt-1 text-muted-foreground">上架與編輯商品（開發中）</p>
      </div>
    </div>
  );
}
