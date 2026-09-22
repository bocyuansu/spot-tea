import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPriceTWD } from '@/lib/format';
import EcpayPayButton from '@/features/payments/components/EcpayPayButton';

type EcpayPaymentCardProps = {
  orderNumber: string;
  totalAmount: number;
  // 剛從綠界付款頁回來而且沒有成功
  lastAttemptIncomplete?: boolean;
};

/**
 * 綠界信用卡訂單尚未付款時顯示在完成頁，第一次付款與付款失敗後重付都走這裡。
 */
export default function EcpayPaymentCard({
  orderNumber,
  totalAmount,
  lastAttemptIncomplete = false,
}: EcpayPaymentCardProps) {
  return (
    <Card className="border-primary/40">
      <CardHeader>
        <CardTitle>尚未完成付款</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {/* 綠界有些結果（例如待確認）其實已經扣款，只是還沒核准，所以不叫顧客直接重付 */}
        {lastAttemptIncomplete && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive dark:bg-destructive/20">
            這次付款沒有完成。若您的卡片已經被扣款，請先不要重複付款，並與我們聯繫。
          </p>
        )}
        <p className="text-muted-foreground">
          訂單已保留，請前往綠界科技付款頁以信用卡支付{' '}
          <span className="font-medium text-foreground">
            {formatPriceTWD(totalAmount)}
          </span>
          。付款完成後我們會盡快為您出貨。
        </p>
        <EcpayPayButton
          orderNumber={orderNumber}
          size="lg"
          className="w-full sm:w-auto"
        />
      </CardContent>
    </Card>
  );
}
