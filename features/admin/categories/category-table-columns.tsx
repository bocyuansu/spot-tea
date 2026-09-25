import { formatDateTW } from '@/lib/format';
import type { AdminCategoryWithCount } from '@/db/queries/admin/categories';
import CategoryMenu from '@/features/admin/categories/components/CategoryMenu';
import { createAppColumnHelper } from '@/features/admin/shared/admin-table';
import { createSelectColumn } from '@/features/admin/shared/select-column';

const columnHelper = createAppColumnHelper<AdminCategoryWithCount>();

export const columns = columnHelper.columns([
  createSelectColumn<AdminCategoryWithCount>('分類'),
  // 搜尋只比對名稱和網址代稱：都是表格上看得到的字，才看得出每筆結果為什麼符合
  columnHelper.accessor('name', {
    header: '分類',
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    sortFn: 'zhHant',
  }),
  columnHelper.accessor('slug', {
    header: '網址代稱',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {getValue()}
      </span>
    ),
    sortFn: 'zhHant',
  }),
  columnHelper.accessor('productCount', {
    header: '商品數',
    enableGlobalFilter: false,
    meta: { className: 'text-right' },
  }),
  columnHelper.accessor('createdAt', {
    header: '建立日期',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{formatDateTW(getValue())}</span>
    ),
    sortFn: 'datetime',
    enableGlobalFilter: false,
    meta: { className: 'text-right' },
  }),
  columnHelper.display({
    id: 'actions',
    header: '操作',
    cell: ({ row }) => <CategoryMenu category={row.original} />,
    meta: { className: 'w-24 text-right' },
  }),
]);
