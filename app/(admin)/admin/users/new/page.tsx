import type { Metadata } from 'next';
import AdminUserCreateForm from '@/features/admin/components/AdminUserCreateForm';

export const metadata: Metadata = {
  title: '新增會員',
};

export default function AdminUserCreatePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">新增會員</h1>
        <p className="mt-1 text-muted-foreground">直接建立一個已經可以登入的帳號</p>
      </div>

      <AdminUserCreateForm />
    </div>
  );
}
