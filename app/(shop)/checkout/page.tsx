import type { Metadata } from 'next';
import { getSession } from '@/lib/session';
import CheckoutView from '@/features/checkout/components/CheckoutView';
import SessionExpiredCard from '@/features/user/components/SessionExpiredCard';

export const metadata: Metadata = {
  title: '結帳',
  description: '找茶 結帳',
};

export default async function CheckoutPage() {
  const session = await getSession();

  // 沒帶 cookie 的訪客已經被 proxy.ts 擋掉，這裡只會遇到 cookie 還在、session 卻失效的情況
  if (!session) {
    return <SessionExpiredCard />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">結帳</h1>
        <p className="mt-1 text-muted-foreground">填寫收件資訊，確認訂單內容</p>
      </div>

      <CheckoutView defaultRecipientName={session.user.name} />
    </div>
  );
}
