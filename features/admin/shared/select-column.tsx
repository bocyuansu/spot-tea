import { Checkbox } from '@/components/ui/checkbox';
import { createAppColumnHelper } from '@/features/admin/shared/admin-table';

/**
 * 可批次操作的列表（商品、分類）最前面的勾選欄。
 * 勾選狀態以資料的 id 為 key，換頁後已勾的列仍會留著；全選只會選到目前這一頁
 * @param itemLabel 列表項目的名稱，例如「商品」，用在全選框的「選取本頁所有商品」
 */
export function createSelectColumn<TData extends { name: string }>(
  itemLabel: string,
) {
  return createAppColumnHelper<TData>().display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label={`選取本頁所有${itemLabel}`}
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
  });
}
