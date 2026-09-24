import Image from 'next/image';
import Link from 'next/link';
import {
  createColumnHelper,
  createExpandedRowModel,
  createPaginatedRowModel,
  metaHelper,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  tableFeatures,
} from '@tanstack/react-table';
import { ChevronRight, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { productStatusLabels } from '@/features/products/product-status';
import { formatPriceTWD } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AdminProduct } from '@/db/queries/admin/products';
import ProductMenu from '@/features/admin/products/components/ProductMenu';

// 同一個 className 會同時套在 <th> 與 <td>，讓標題和內容的寬度、對齊一致
type ProductColumnMeta = {
  className?: string;
};

// 欄位的型別是從 features 推導的，所以 features 和 columns 放在同一個檔案
export const features = tableFeatures({
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  columnMeta: metaHelper<ProductColumnMeta>(),
});

function formatPriceRange(variants: AdminProduct['variants']) {
  if (variants.length === 0) return '—';

  const prices = variants.map((variant) => variant.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return minPrice === maxPrice
    ? formatPriceTWD(minPrice)
    : `${formatPriceTWD(minPrice)} – ${formatPriceTWD(maxPrice)}`;
}

const columnHelper = createColumnHelper<typeof features, AdminProduct>();

export const columns = columnHelper.columns([
  // 勾選狀態以商品 id 為 key，換頁後已勾的商品仍會留著；全選只會選到目前這一頁
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label="選取本頁所有商品"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
        className="border-primary"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`選取 ${row.original.name}`}
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
        className="border-primary"
      />
    ),
    meta: { className: 'w-8' },
  }),
  columnHelper.display({
    id: 'expander',
    header: () => <span className="sr-only">展開規格</span>,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={!row.getCanExpand()}
        aria-expanded={row.getIsExpanded()}
        aria-label={`${row.getIsExpanded() ? '收合' : '展開'} ${row.original.name} 的規格`}
        onClick={row.getToggleExpandedHandler()}
      >
        <ChevronRight
          className={cn(
            'size-4 transition-transform',
            row.getIsExpanded() && 'rotate-90',
          )}
        />
      </Button>
    ),
    meta: { className: 'w-10' },
  }),
  columnHelper.accessor((product) => product.images?.[0] ?? null, {
    id: 'image',
    header: '圖片',
    cell: ({ row, getValue }) => {
      const productImgUrl = getValue();

      return productImgUrl ? (
        <Link
          href={productImgUrl}
          prefetch={false}
          className="w-full flex justify-center items-center"
        >
          <Image
            src={productImgUrl}
            alt={row.original.name}
            width={40}
            height={40}
            className="size-10 rounded-md object-cover ring-1 ring-foreground/10"
          />
        </Link>
      ) : (
        <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground/50">
          <Leaf className="size-4" />
        </div>
      );
    },
    meta: { className: 'w-16 text-center' },
  }),
  columnHelper.accessor('name', {
    header: '商品',
    cell: ({ row, getValue }) => (
      <div className="flex flex-col">
        <span className="font-medium">{getValue()}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.slug}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor((product) => product.category?.name ?? '未分類', {
    id: 'category',
    header: '分類',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  }),
  columnHelper.accessor('status', {
    header: '狀態',
    cell: ({ getValue }) => (
      <Badge variant={getValue() === 'published' ? 'default' : 'outline'}>
        {productStatusLabels[getValue()]}
      </Badge>
    ),
    meta: { className: 'text-center' },
  }),
  columnHelper.accessor((product) => formatPriceRange(product.variants), {
    id: 'price',
    header: '價格',
    meta: { className: 'text-right' },
  }),
  columnHelper.accessor(
    (product) =>
      product.variants.reduce((total, variant) => total + variant.stock, 0),
    {
      id: 'totalStock',
      header: '總庫存',
      cell: ({ getValue }) => (
        <span className={cn(getValue() === 0 && 'text-destructive')}>
          {getValue()}
        </span>
      ),
      meta: { className: 'text-right' },
    },
  ),
  columnHelper.display({
    id: 'actions',
    header: '操作',
    cell: ({ row }) => (
      <ProductMenu
        productId={row.original.id}
        productName={row.original.name}
      />
    ),
    meta: { className: 'w-24 text-right' },
  }),
]);
