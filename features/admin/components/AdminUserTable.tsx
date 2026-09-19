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
import { formatDateTW } from '@/lib/format';
import type { AdminUser } from '@/db/queries/admin';

// admin plugin 的 defaultRole 是 customer，舊資料仍可能沒有角色
const roleLabels: Record<string, string> = {
  admin: '管理員',
  customer: '一般會員',
};

type AdminUserTableProps = {
  users: AdminUser[];
};

export default function AdminUserTable({ users }: AdminUserTableProps) {
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
