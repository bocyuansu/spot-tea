import { Badge } from '@/components/ui/badge';
import {
  getPaymentMethodLabel,
  isAwaitingRefund,
  orderStatusLabels,
  orderStatusVariants,
  paymentStatusLabels,
  paymentStatusVariants,
} from '@/features/orders/order-status';
import { formatDateTW, formatPriceTWD } from '@/lib/format';
import type { AdminOrder } from '@/db/queries/admin/orders';
import OrderMenu from '@/features/admin/orders/components/OrderMenu';
import { createAppColumnHelper } from '@/features/admin/shared/admin-table';

const columnHelper = createAppColumnHelper<AdminOrder>();

export const columns = columnHelper.columns([
  // 搜尋只比對訂單編號和會員：都是表格上看得到的字，才看得出每筆結果為什麼符合
  columnHelper.accessor('orderNumber', {
    header: '訂單編號',
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    sortFn: 'zhHant',
  }),
  // 名稱和 Email 都顯示在這一格，值把兩者接在一起才搜得到 Email；排序也就是先比名稱再比 Email
  columnHelper.accessor((order) => `${order.user.name} ${order.user.email}`, {
    id: 'member',
    header: '會員',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.user.name}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.user.email}
        </span>
      </div>
    ),
    sortFn: 'zhHant',
  }),
  // 狀態的值用畫面上的中文標籤，排序才會照看到的字排
  columnHelper.accessor((order) => orderStatusLabels[order.status], {
    id: 'status',
    header: '訂單狀態',
    cell: ({ row, getValue }) => (
      <Badge variant={orderStatusVariants[row.original.status]}>
        {getValue()}
      </Badge>
    ),
    sortFn: 'zhHant',
    enableGlobalFilter: false,
  }),
  columnHelper.accessor((order) => paymentStatusLabels[order.paymentStatus], {
    id: 'paymentStatus',
    header: '付款狀態',
    cell: ({ row, getValue }) => (
      <div className="flex flex-wrap gap-1">
        <Badge variant={paymentStatusVariants[row.original.paymentStatus]}>
          {getValue()}
        </Badge>
        {isAwaitingRefund(row.original) && (
          <Badge variant="destructive">待退款</Badge>
        )}
      </div>
    ),
    sortFn: 'zhHant',
    enableGlobalFilter: false,
  }),
  columnHelper.accessor(
    (order) => getPaymentMethodLabel(order.paymentProvider),
    {
      id: 'paymentMethod',
      header: '付款方式',
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue()}</span>
      ),
      sortFn: 'zhHant',
      enableGlobalFilter: false,
    },
  ),
  columnHelper.accessor('createdAt', {
    header: '下單日期',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{formatDateTW(getValue())}</span>
    ),
    sortFn: 'datetime',
    enableGlobalFilter: false,
  }),
  columnHelper.accessor('totalAmount', {
    header: '金額',
    cell: ({ getValue }) => (
      <span className="font-medium text-primary">
        {formatPriceTWD(getValue())}
      </span>
    ),
    enableGlobalFilter: false,
    meta: { className: 'text-right' },
  }),
  columnHelper.display({
    id: 'actions',
    header: '操作',
    cell: ({ row }) => (
      <OrderMenu
        orderId={row.original.id}
        orderNumber={row.original.orderNumber}
      />
    ),
    meta: { className: 'text-right' },
  }),
]);
