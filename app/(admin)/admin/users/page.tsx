import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createAuth } from '@/lib/auth';
import { listAdminUsers } from '@/db/queries/admin/users';
import UserTable from '@/features/admin/users/components/UserTable';

export const metadata: Metadata = {
  title: '使用者管理',
};

export default async function AdminUsersPage() {
  const auth = await createAuth();

  const [users, session] = await Promise.all([
    listAdminUsers(),
    auth.api.getSession({ headers: await headers() }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl">使用者管理</h1>
          <p className="mt-1 text-muted-foreground">共 {users.length} 位會員</p>
        </div>

        <Button render={<Link href="/admin/users/new" />} nativeButton={false}>
          <Plus className="size-4" />
          <span>新增會員</span>
        </Button>
      </div>

      <UserTable users={users} currentUserId={session?.user.id ?? ''} />
    </div>
  );
}
