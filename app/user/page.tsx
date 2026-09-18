import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { createAuth } from '@/lib/auth';
import { listUserOrders } from '@/db/queries/orders';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // 沒帶 cookie 的訪客已經被 proxy.ts 擋在外面，這裡只會遇到 cookie 還在、
  // session 卻已失效的情況。這裡不能用 redirect()：頁面的 307 會被 Cloudflare
  // 的快取 entrypoint 自己追下去，變成無限轉址（見 proxy.ts 的說明）。
  if (!session) {
    return (
      <Card className="w-full max-w-sm mx-auto my-8 [--card-spacing:--spacing(8)]">
        <CardHeader>
          <CardTitle className="text-2xl">登入狀態已失效</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground">請重新登入後再查看會員中心。</p>
          <Link href="/login" className={buttonVariants({ size: 'lg' })}>
            前往登入
          </Link>
        </CardContent>
      </Card>
    );
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
