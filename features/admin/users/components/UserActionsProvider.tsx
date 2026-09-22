'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { AdminUser } from '@/db/queries/admin/users';

type UserDialogName = 'edit' | 'ban' | 'delete';

type UserActionsContextValue = {
  user: AdminUser;
  // 停權或刪除自己會把管理員鎖在後台外面，admin plugin 也會回 YOU_CANNOT_BAN_YOURSELF
  isSelf: boolean;
  banned: boolean;
  // 有訂單的會員刪不掉（order.userId 是財務紀錄，沒設 onDelete），自己也不能刪自己
  deleteDisabledReason?: string;
  // 同一列的三個對話框一次只會開一個，所以共用一個狀態
  activeDialog: UserDialogName | null;
  setActiveDialog: (dialog: UserDialogName | null) => void;
};

const UserActionsContext = createContext<UserActionsContextValue | null>(null);

// order.userId 沒設 onDelete，有訂單的會員在資料庫層就刪不掉，先在 UI 擋下來
function getDeleteDisabledReason(user: AdminUser, isSelf: boolean) {
  if (isSelf) return '不能刪除自己的帳號';
  if (user.orderCount > 0) return '這位會員已有訂單紀錄，無法刪除';
  return undefined;
}

type UserActionsProviderProps = {
  user: AdminUser;
  // 用來擋住「停權/刪除自己」這件事
  currentUserId: string;
  children: React.ReactNode;
};

export default function UserActionsProvider({
  user,
  currentUserId,
  children,
}: UserActionsProviderProps) {
  const [activeDialog, setActiveDialog] = useState<UserDialogName | null>(null);

  const value = useMemo<UserActionsContextValue>(() => {
    const isSelf = user.id === currentUserId;

    return {
      user,
      isSelf,
      banned: Boolean(user.banned),
      deleteDisabledReason: getDeleteDisabledReason(user, isSelf),
      activeDialog,
      setActiveDialog,
    };
  }, [user, currentUserId, activeDialog]);

  return (
    <UserActionsContext.Provider value={value}>
      {children}
    </UserActionsContext.Provider>
  );
}

export function useUserActions() {
  const context = useContext(UserActionsContext);

  if (!context) {
    throw new Error('useUserActions 必須在 UserActionsProvider 內使用');
  }

  return context;
}

// 每個對話框只在意自己有沒有被打開，所以把共用的狀態收成 open / onOpenChange
export function useUserDialog(dialog: UserDialogName) {
  const context = useUserActions();

  return {
    ...context,
    open: context.activeDialog === dialog,
    onOpenChange: (open: boolean) =>
      context.setActiveDialog(open ? dialog : null),
  };
}
