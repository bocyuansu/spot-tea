import type { Metadata } from 'next';
import { listAdminUsers } from '@/db/queries/admin';
import AdminUserTable from '@/features/admin/components/AdminUserTable';

export const metadata: Metadata = {
  title: '使用者管理',
};

export default async function AdminUsersPage() {
  const users = await listAdminUsers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">使用者管理</h1>
        <p className="mt-1 text-muted-foreground">共 {users.length} 位會員</p>
      </div>

      <AdminUserTable users={users} />
    </div>
  );
}
