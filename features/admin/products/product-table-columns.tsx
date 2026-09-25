import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { productStatusLabels } from '@/features/products/product-status';
import { formatPriceTWD } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AdminProduct } from '@/db/queries/admin/products';
import ProductMenu from '@/features/admin/products/components/ProductMenu';
import { createAppColumnHelper } from '@/features/admin/shared/admin-table';
import { createSelectColumn } from '@/features/admin/shared/select-column';

function formatPriceRange(variants: AdminProduct['variants']) {
  if (variants.length === 0) return '—';

  const prices = variants.map((variant) => variant.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return minPrice === maxPrice
    ? formatPriceTWD(minPrice)
    : `${formatPriceTWD(minPrice)} – ${formatPriceTWD(maxPrice)}`;
}

const columnHelper = createAppColumnHelper<AdminProduct>();

export const columns = columnHelper.columns([
  createSelectColumn<AdminProduct>('商品'),
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
  columnHelper.display({
    id: 'image',
    header: '圖片',
    cell: ({ row }) => {
      const productImgUrl = row.original.images?.[0];

      return productImgUrl ? (
        <Link
          href={`/products/${row.original.slug}`}
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
  // 搜尋只比對名稱和分類：都是表格上看得到的字，才看得出每筆結果為什麼符合
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
    sortFn: 'zhHant',
  }),
  columnHelper.accessor((product) => product.category?.name ?? '未分類', {
    id: 'category',
    header: '分類',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
    sortFn: 'zhHant',
  }),
  // 值用畫面上的中文標籤，排序才會照看到的字排：已上架、已下架、草稿
  columnHelper.accessor((product) => productStatusLabels[product.status], {
    id: 'status',
    header: '狀態',
    cell: ({ row, getValue }) => (
      <Badge
        variant={row.original.status === 'published' ? 'default' : 'outline'}
      >
        {getValue()}
      </Badge>
    ),
    sortFn: 'zhHant',
    enableGlobalFilter: false,
    meta: { className: 'text-center' },
  }),
  // 依最低價排序；還沒有規格的商品沒有價格，不論升冪降冪都排在最後
  columnHelper.accessor(
    (product) =>
      product.variants.length > 0
        ? Math.min(...product.variants.map((variant) => variant.price))
        : undefined,
    {
      id: 'price',
      header: '價格',
      cell: ({ row }) => formatPriceRange(row.original.variants),
      sortUndefined: 'last',
      enableGlobalFilter: false,
      meta: { className: 'text-right' },
    },
  ),
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
      enableGlobalFilter: false,
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
