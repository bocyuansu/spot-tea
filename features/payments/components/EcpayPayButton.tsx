'use client';

import { useEffect, useState, useTransition, type ComponentProps } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { startEcpayPayment } from '@/features/payments/actions/ecpay';

type EcpayPayButtonProps = {
  orderNumber: string;
  size?: ComponentProps<typeof Button>['size'];
  className?: string;
};

/**
 * 前往綠界付款的按鈕，完成頁的付款卡片與「我的訂單」都用它。
 *
 * 綠界要求由瀏覽器把表單 submit 到付款頁（整頁跳轉，不能 fetch、不能 iframe），
 * 所以拿到 server 算好的欄位後，臨時組一個隱藏表單送出。
 */
export default function EcpayPayButton({ orderNumber, size, className }: EcpayPayButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isRedirecting, setIsRedirecting] = useState(false);

  function handlePay() {
    startTransition(async () => {
      const result = await startEcpayPayment(orderNumber);

      if (!result.ok) {
        toast.add({ type: 'error', description: result.message, priority: 'high' });
        return;
      }

      // 建一個隱藏的 form，整頁 POST 到綠界
      // 綠界規定不能用 fetch 或 iframe
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = result.action;

      for (const [name, value] of Object.entries(result.fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
      // 表單送出到頁面真正離開之間還有一段空檔，按鈕要維持停用，免得重複送單
      setIsRedirecting(true);
    });
  }

  // 從綠界按上一頁回來時，瀏覽器可能直接從 bfcache 還原這頁，停用狀態也會一起被還原
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) setIsRedirecting(false);
    }

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const isBusy = isPending || isRedirecting;

  return (
    <Button size={size} className={className} disabled={isBusy} onClick={handlePay}>
      {isBusy ? (
        <>
          <Loader2 className="animate-spin" />
          <span>前往付款頁中</span>
        </>
      ) : (
        <>
          <CreditCard />
          <span>前往付款</span>
        </>
      )}
    </Button>
  );
}
