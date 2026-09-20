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
import UserActions from '@/features/admin/users/components/UserActions';
import { formatDateTW } from '@/lib/format';
import type { AdminUser } from '@/db/queries/admin/users';

// admin plugin 的 defaultRole 是 customer，舊資料仍可能沒有角色
const roleLabels: Record<string, string> = {
  admin: '管理員',
  customer: '一般會員',
};

// 停權到期後 admin plugin 是等會員下次登入才解除，所以列表還是會看到已停權
function banNote(user: AdminUser) {
  const period = user.banExpires ? `${formatDateTW(user.banExpires)} 解除` : '永久停權';
  return user.banReason ? `${period}・${user.banReason}` : period;
}

type UserTableProps = {
  users: AdminUser[];
  // 交給 UserActions 用來擋住「停權/刪除自己」這件事
  currentUserId: string;
};

export default function UserTable({ users, currentUserId }: UserTableProps) {
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
                    <div className="flex flex-col items-start gap-1">
                      <Badge variant="destructive">已停權</Badge>
                      <span className="max-w-40 truncate text-xs text-muted-foreground">
                        {banNote(user)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">正常</span>
                  )}
                </TableCell>
                <TableCell className="text-right">{user.orderCount}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDateTW(user.createdAt)}
                </TableCell>
                <TableCell>
                  <UserActions user={user} currentUserId={currentUserId} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
