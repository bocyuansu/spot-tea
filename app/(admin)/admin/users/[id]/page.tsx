import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getAdminUserById } from '@/db/queries/admin';
import AdminUserEditForm from '@/features/admin/components/AdminUserEditForm';
import { createAuth } from '@/lib/auth';

export const metadata: Metadata = {
  title: '編輯會員',
};

type AdminUserEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserEditPage({ params }: AdminUserEditPageProps) {
  const { id } = await params;

  const auth = await createAuth();

  const [user, session] = await Promise.all([
    getAdminUserById(id),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!user) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">編輯會員</h1>
        <p className="mt-1 text-muted-foreground">{user.email}</p>
      </div>

      <AdminUserEditForm user={user} isSelf={session?.user.id === user.id} />
    </div>
  );
}
