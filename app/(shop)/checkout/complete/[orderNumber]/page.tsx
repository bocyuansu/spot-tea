import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CircleCheck, CreditCard } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { getSession } from '@/lib/session';
import { getUserOrderByNumber } from '@/db/queries/orders';
import OrderCard from '@/features/orders/components/OrderCard';
import ClearCartOnMount from '@/features/checkout/components/ClearCartOnMount';
import EcpayPaymentCard from '@/features/payments/components/EcpayPaymentCard';
import { isAwaitingEcpayPayment } from '@/features/orders/order-status';
import SessionExpiredCard from '@/features/user/components/SessionExpiredCard';

export const metadata: Metadata = {
  title: '訂單完成',
  description: '找茶 訂單完成',
};

type CheckoutCompletePageProps = {
  params: Promise<{ orderNumber: string }>;
  // 綠界付款沒有成功時，api/payments/ecpay/result 會帶 payment=incomplete 導回來
  searchParams: Promise<{ payment?: string }>;
};

export default async function CheckoutCompletePage({
  params,
  searchParams,
}: CheckoutCompletePageProps) {
  const { orderNumber } = await params;
  const { payment } = await searchParams;

  const session = await getSession();

  if (!session) {
    return <SessionExpiredCard />;
  }

  const order = await getUserOrderByNumber(session.user.id, orderNumber);

  if (!order) notFound();

  // 綠界付款回來也導到這頁；付款失敗或中途離開時訂單仍是 unpaid，可以在這裡重付
  const awaitingPayment = isAwaitingEcpayPayment(order);

  return (
    <div className="flex flex-col gap-6">
      <ClearCartOnMount orderNumber={order.orderNumber} />

      <div className="flex flex-col items-center gap-2 text-center">
        {awaitingPayment ? (
          <CreditCard className="size-12 text-primary" />
        ) : (
          <CircleCheck className="size-12 text-primary" />
        )}
        <h1 className="font-heading text-3xl md:text-4xl">
          {awaitingPayment ? '訂單已成立，請完成付款' : '感謝您的訂購 !'}
        </h1>
        <p className="text-muted-foreground">訂單編號：{order.orderNumber}</p>
      </div>

      {awaitingPayment && (
        <EcpayPaymentCard
          orderNumber={order.orderNumber}
          totalAmount={order.totalAmount}
          lastAttemptIncomplete={payment === 'incomplete'}
        />
      )}

      <OrderCard order={order} />

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/user/orders" className={buttonVariants({ size: 'lg' })}>
          查看我的訂單
        </Link>
        <Link
          href="/products"
          className={buttonVariants({ variant: 'outline', size: 'lg' })}
        >
          繼續購物
        </Link>
      </div>
    </div>
  );
}
