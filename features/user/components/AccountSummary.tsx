import { CalendarDays, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateTW } from '@/lib/format';
import type { authClient } from '@/lib/auth-client';
import AvatarUploader from '@/features/user/components/AvatarUploader';

// admin plugin 的 defaultRole 是 customer，但舊資料仍可能沒有角色
const roleLabels: Record<string, string> = {
  admin: '管理員',
  customer: '一般會員',
};

type AccountSummaryProps = {
  user: typeof authClient.$Infer.Session.user;
};

export default function AccountSummary({ user }: AccountSummaryProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <AvatarUploader image={user.image} />

        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-xl">{user.name}</h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {roleLabels[user.role ?? ''] ?? '一般會員'}
            </span>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            <span className="truncate">{user.email}</span>
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" />
            <span>加入日期：{formatDateTW(user.createdAt)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
