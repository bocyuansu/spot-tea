import { Badge } from '@/components/ui/badge';
import { formatDateTW } from '@/lib/format';
import type { AdminUser } from '@/db/queries/admin/users';
import UserActions from '@/features/admin/users/components/UserActions';
import { createAppColumnHelper } from '@/features/admin/shared/admin-table';

// admin plugin 的 defaultRole 是 customer，舊資料仍可能沒有角色
const roleLabels: Record<string, string> = {
  admin: '管理員',
  customer: '一般會員',
};

// 停權到期後 admin plugin 是等會員下次登入才解除，所以列表還是會看到已停權
function banNote(user: AdminUser) {
  const period = user.banExpires
    ? `${formatDateTW(user.banExpires)} 解除`
    : '永久停權';
  return user.banReason ? `${period}・${user.banReason}` : period;
}

const columnHelper = createAppColumnHelper<AdminUser>();

// currentUserId 交給 UserActions 用來擋住「停權/刪除自己」這件事，所以欄位要在元件裡依它建立
export function createUserColumns(currentUserId: string) {
  return columnHelper.columns([
    // 搜尋只比對名稱和 Email：都是表格上看得到的字，才看得出每筆結果為什麼符合。
    // 兩者顯示在同一格，值把兩者接在一起才搜得到 Email；排序也就是先比名稱再比 Email
    columnHelper.accessor((user) => `${user.name} ${user.email}`, {
      id: 'member',
      header: '會員',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.email}
          </span>
        </div>
      ),
      sortFn: 'zhHant',
    }),
    // 角色與狀態的值用畫面上的中文標籤，排序才會照看到的字排
    columnHelper.accessor((user) => roleLabels[user.role ?? ''] ?? '一般會員', {
      id: 'role',
      header: '角色',
      cell: ({ row, getValue }) => (
        <Badge
          variant={row.original.role === 'admin' ? 'default' : 'secondary'}
        >
          {getValue()}
        </Badge>
      ),
      sortFn: 'zhHant',
      enableGlobalFilter: false,
    }),
    columnHelper.accessor((user) => (user.banned ? '已停權' : '正常'), {
      id: 'status',
      header: '狀態',
      cell: ({ row, getValue }) =>
        row.original.banned ? (
          <div className="flex flex-col items-start gap-1">
            <Badge variant="destructive">{getValue()}</Badge>
            <span className="max-w-40 truncate text-xs text-muted-foreground">
              {banNote(row.original)}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">{getValue()}</span>
        ),
      sortFn: 'zhHant',
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('orderCount', {
      header: '訂單數',
      enableGlobalFilter: false,
      meta: { className: 'text-right' },
    }),
    columnHelper.accessor('createdAt', {
      header: '加入日期',
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {formatDateTW(getValue())}
        </span>
      ),
      sortFn: 'datetime',
      enableGlobalFilter: false,
      meta: { className: 'text-right' },
    }),
    columnHelper.display({
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <UserActions user={row.original} currentUserId={currentUserId} />
      ),
      meta: { className: 'w-24 text-right' },
    }),
  ]);
}
