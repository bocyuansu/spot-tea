'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconDotsVertical } from '@tabler/icons-react';
import { Ban, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import UserBanDialog from '@/features/admin/users/components/UserBanDialog';
import UserDeleteDialog from '@/features/admin/users/components/UserDeleteDialog';
import UserEditDialog from '@/features/admin/users/components/UserEditDialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { AdminUser } from '@/db/queries/admin/users';

export default function UserMenu({
  user,
  isSelf,
  deleteDisabledReason,
}: {
  user: AdminUser;
  // 停權自己會把管理員鎖在後台外面，admin plugin 也會回 YOU_CANNOT_BAN_YOURSELF
  isSelf: boolean;
  // 有訂單的會員刪不掉（order.userId 是財務紀錄，沒設 onDelete），自己也不能刪自己
  deleteDisabledReason?: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const banned = Boolean(user.banned);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-25">
          <DropdownMenuItem aria-label={`編輯 ${user.name}`} onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" /> 編輯
          </DropdownMenuItem>
          <DropdownMenuItem
            variant={banned ? 'default' : 'destructive'}
            disabled={isSelf}
            aria-label={
              isSelf ? '不能停權自己的帳號' : `${banned ? '解除停權' : '停權'} ${user.name}`
            }
            onClick={() => setBanOpen(true)}
          >
            {banned ? (
              <>
                <ShieldCheck className="size-4" /> 解除停權
              </>
            ) : (
              <>
                <Ban className="size-4" /> 停權
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={Boolean(deleteDisabledReason)}
            aria-label={deleteDisabledReason ?? `刪除 ${user.name}`}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" /> 刪除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UserEditDialog user={user} isSelf={isSelf} open={editOpen} onOpenChange={setEditOpen} />
      <UserBanDialog
        userId={user.id}
        userName={user.name}
        banned={banned}
        open={banOpen}
        onOpenChange={setBanOpen}
      />
      <UserDeleteDialog
        userId={user.id}
        userName={user.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
