import type { Metadata } from 'next';
import { getSession } from '@/lib/session';
import AccountSummary from '@/features/user/components/AccountSummary';
import ProfileForm from '@/features/user/components/ProfileForm';
import ChangePasswordForm from '@/features/user/components/ChangePasswordForm';
import SessionExpiredCard from '@/features/user/components/SessionExpiredCard';

export const metadata: Metadata = {
  title: '會員中心',
  description: '找茶 會員中心',
};

export default async function UserPage() {
  const session = await getSession();

  if (!session) {
    return <SessionExpiredCard />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">會員中心</h1>
        <p className="mt-1 text-muted-foreground">管理您的個人資料</p>
      </div>

      <AccountSummary user={session.user} />

      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <ProfileForm defaultName={session.user.name} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
