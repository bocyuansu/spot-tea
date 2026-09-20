'use client';

import UserActionsProvider from '@/features/admin/users/components/UserActionsProvider';
import UserBanDialog from '@/features/admin/users/components/UserBanDialog';
import UserDeleteDialog from '@/features/admin/users/components/UserDeleteDialog';
import UserEditDialog from '@/features/admin/users/components/UserEditDialog';
import UserMenu from '@/features/admin/users/components/UserMenu';
import type { AdminUser } from '@/db/queries/admin/users';

// 表格「操作」欄：選單與三個對話框共用同一份會員資料與開關狀態
export default function UserActions({
  user,
  currentUserId,
}: {
  user: AdminUser;
  currentUserId: string;
}) {
  return (
    <UserActionsProvider user={user} currentUserId={currentUserId}>
      <div className="flex justify-end">
        <UserMenu />
        {/* 對話框只讀 context，不必再從選單一層層傳進去 */}
        <UserEditDialog />
        <UserBanDialog />
        <UserDeleteDialog />
      </div>
    </UserActionsProvider>
  );
}
