import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AdminUserMenu from '@/features/admin/components/AdminUserMenu';
import { formatDateTW } from '@/lib/format';
import type { AdminUser } from '@/db/queries/admin';

// admin plugin 的 defaultRole 是 customer，舊資料仍可能沒有角色
const roleLabels: Record<string, string> = {
  admin: '管理員',
  customer: '一般會員',
};

// order.userId 沒設 onDelete，有訂單的會員在資料庫層就刪不掉，先在 UI 擋下來
function deleteDisabledReason(user: AdminUser, currentUserId: string) {
  if (user.id === currentUserId) return '不能刪除自己的帳號';
  if (user.orderCount > 0) return '這位會員已有訂單紀錄，無法刪除';
  return undefined;
}

type AdminUserTableProps = {
  users: AdminUser[];
  // 用來擋住「刪除自己」這件事
  currentUserId: string;
};

export default function AdminUserTable({ users, currentUserId }: AdminUserTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <p>目前還沒有任何會員</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>會員</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="text-right">訂單數</TableHead>
              <TableHead className="text-right">加入日期</TableHead>
              <TableHead className="w-24 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {roleLabels[user.role ?? ''] ?? '一般會員'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.banned ? (
                    <Badge variant="destructive">已停權</Badge>
                  ) : (
                    <span className="text-muted-foreground">正常</span>
                  )}
                </TableCell>
                <TableCell className="text-right">{user.orderCount}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDateTW(user.createdAt)}
                </TableCell>
                <TableCell>
                  <AdminUserMenu
                    userId={user.id}
                    userName={user.name}
                    disabledReason={deleteDisabledReason(user, currentUserId)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
