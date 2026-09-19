'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconDotsVertical } from '@tabler/icons-react';
import { Pencil, Trash2 } from 'lucide-react';
import AdminUserDeleteDialog from '@/features/admin/components/AdminUserDeleteDialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminUserMenu({
  userId,
  userName,
  disabledReason,
}: {
  userId: string;
  userName: string;
  // 有訂單的會員刪不掉（order.userId 是財務紀錄，沒設 onDelete），自己也不能刪自己
  disabledReason?: string;
}) {
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
            variant="destructive"
            disabled={Boolean(disabledReason)}
            aria-label={disabledReason ?? `刪除 ${userName}`}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" /> 刪除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AdminUserDeleteDialog
        userId={userId}
        userName={userName}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
