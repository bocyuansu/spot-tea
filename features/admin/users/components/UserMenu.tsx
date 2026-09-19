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
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

export default function UserMenu({
  userId,
  userName,
  banned,
  isSelf,
  deleteDisabledReason,
}: {
  userId: string;
  userName: string;
  banned: boolean;
  // 停權自己會把管理員鎖在後台外面，admin plugin 也會回 YOU_CANNOT_BAN_YOURSELF
  isSelf: boolean;
  // 有訂單的會員刪不掉（order.userId 是財務紀錄，沒設 onDelete），自己也不能刪自己
  deleteDisabledReason?: string;
}) {
  const [banOpen, setBanOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-25">
          <DropdownMenuItem
            aria-label={`編輯 ${userName}`}
            render={<Link href={`/admin/users/${userId}`} />}
          >
            <Pencil className="size-4" /> 編輯
          </DropdownMenuItem>
          <DropdownMenuItem
            variant={banned ? 'default' : 'destructive'}
            disabled={isSelf}
            aria-label={
              isSelf ? '不能停權自己的帳號' : `${banned ? '解除停權' : '停權'} ${userName}`
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
            aria-label={deleteDisabledReason ?? `刪除 ${userName}`}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" /> 刪除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UserBanDialog
        userId={userId}
        userName={userName}
        banned={banned}
        open={banOpen}
        onOpenChange={setBanOpen}
      />
      <UserDeleteDialog
        userId={userId}
        userName={userName}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
