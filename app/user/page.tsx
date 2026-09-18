import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAuth } from '@/lib/auth';
import { listUserOrders } from '@/db/queries/orders';
import AccountSummary from '@/features/user/components/AccountSummary';
import ProfileForm from '@/features/user/components/ProfileForm';
import ChangePasswordForm from '@/features/user/components/ChangePasswordForm';
import OrderHistory from '@/features/orders/components/OrderHistory';

export const metadata: Metadata = {
  title: '會員中心',
  description: '找茶 會員中心',
};

export default async function UserPage() {
  const auth = await createAuth();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 會員資料只有本人看得到，未登入一律導回登入頁
  if (!session) {
    redirect('/login');
  }

  const orders = await listUserOrders(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">會員中心</h1>
        <p className="mt-1 text-muted-foreground">管理您的個人資料，並查看訂單紀錄</p>
      </div>

      <AccountSummary user={session.user} />

      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <ProfileForm defaultName={session.user.name} />
        <ChangePasswordForm />
      </div>

      <OrderHistory orders={orders} />
    </div>
  );
}
