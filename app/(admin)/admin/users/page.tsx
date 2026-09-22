import type { Metadata } from 'next';
import { listAdminUsers } from '@/db/queries/admin/users';
import UserCreateDialog from '@/features/admin/users/components/UserCreateDialog';
import UserTable from '@/features/admin/users/components/UserTable';
import { getAdminUser } from '@/features/admin/shared/admin-guard';

export const metadata: Metadata = {
  title: '使用者管理',
};

export default async function AdminUsersPage() {
  const admin = await getAdminUser();
  if (!admin) return null;

  const users = await listAdminUsers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl">使用者管理</h1>
          <p className="mt-1 text-muted-foreground">共 {users.length} 位會員</p>
        </div>

        <UserCreateDialog />
      </div>

      <UserTable users={users} currentUserId={admin.id} />
    </div>
  );
}
