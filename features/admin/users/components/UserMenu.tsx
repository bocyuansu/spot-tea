'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconDotsVertical } from '@tabler/icons-react';
import { Ban, Pencil, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserActions } from '@/features/admin/users/components/UserActionsProvider';

export default function UserMenu() {
  const { user, isSelf, banned, setActiveDialog } = useUserActions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <IconDotsVertical />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-25">
        <DropdownMenuItem
          aria-label={`編輯 ${user.name}`}
          onClick={() => setActiveDialog('edit')}
        >
          <Pencil className="size-4" /> 編輯
        </DropdownMenuItem>
        <DropdownMenuItem
          variant={banned ? 'default' : 'destructive'}
          disabled={isSelf}
          aria-label={
            isSelf
              ? '不能停權自己的帳號'
              : `${banned ? '解除停權' : '停權'} ${user.name}`
          }
          onClick={() => setActiveDialog('ban')}
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
