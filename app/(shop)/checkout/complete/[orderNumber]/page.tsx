import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CircleCheck } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { getSession } from '@/lib/session';
import { getUserOrderByNumber } from '@/db/queries/orders';
import OrderCard from '@/features/orders/components/OrderCard';
import ShippingPaymentCard from '@/components/common/ShippingPaymentCard';
import ClearCartOnMount from '@/features/checkout/components/ClearCartOnMount';
import SessionExpiredCard from '@/features/user/components/SessionExpiredCard';

export const metadata: Metadata = {
  title: '訂單完成',
  description: '找茶 訂單完成',
};

type CheckoutCompletePageProps = {
  params: Promise<{ orderNumber: string }>;
};

export default async function CheckoutCompletePage({ params }: CheckoutCompletePageProps) {
  const { orderNumber } = await params;

  const session = await getSession();

  if (!session) {
    return <SessionExpiredCard />;
  }

  const order = await getUserOrderByNumber(session.user.id, orderNumber);

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <ClearCartOnMount orderNumber={order.orderNumber} />

      <div className="flex flex-col items-center gap-2 text-center">
        <CircleCheck className="size-12 text-primary" />
        <h1 className="font-heading text-3xl md:text-4xl">感謝您的訂購 !</h1>
        <p className="text-muted-foreground">訂單編號：{order.orderNumber}</p>
      </div>

      <OrderCard order={order} />

      <ShippingPaymentCard order={order} />

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/user/orders" className={buttonVariants({ size: 'lg' })}>
          查看我的訂單
        </Link>
        <Link href="/products" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
          繼續購物
        </Link>
      </div>
    </div>
  );
}
