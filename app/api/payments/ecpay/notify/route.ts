import {
  applyEcpayResult,
  readEcpayParams,
} from '@/features/payments/ecpay-result';

/**
 * 綠界 ReturnURL：付款結果的 server 對 server 通知。
 *
 * 必須在 10 秒內以 HTTP 200 回純文字 1|OK（不能有引號、換行或改成小寫），
 * 否則綠界每 5–15 分鐘重送一次。驗證失敗也照樣回 1|OK：偽造的請求重送也不會變成真的。
 * 只有資料庫寫入失敗才回 500，讓綠界重送、之後再補寫一次。
 */
export async function POST(request: Request) {
  try {
    const ecpayParams = await readEcpayParams(request);
    await applyEcpayResult(ecpayParams);
  } catch (error) {
    console.error('[ecpay] 處理付款通知失敗', error);
    return new Response('0|ERROR', { status: 500 });
  }

  return new Response('1|OK', { headers: { 'content-type': 'text/plain' } });
}
