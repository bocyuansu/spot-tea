import { Checkbox } from '@/components/ui/checkbox';
import { formatDateTW } from '@/lib/format';
import type { AdminCategoryWithCount } from '@/db/queries/admin/categories';
import CategoryMenu from '@/features/admin/categories/components/CategoryMenu';
import { createAppColumnHelper } from '@/features/admin/shared/admin-table';

const columnHelper = createAppColumnHelper<AdminCategoryWithCount>();

export const columns = columnHelper.columns([
  // 勾選狀態以分類 id 為 key，換頁後已勾的分類仍會留著；全選只會選到目前這一頁
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label="選取本頁所有分類"
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
