import { applyEcpayResult, readEcpayParams } from '@/features/payments/ecpay-result';

/**
 * 綠界 OrderResultURL：消費者付款後，綠界付款頁以 form POST 把瀏覽器帶回這裡。
 *
 * 頁面收不了 POST，所以先在這裡驗證並回寫，再用 303 轉成 GET 導到訂單完成頁。
 * 這個 303 不會踩到 proxy.ts 說的無限轉址：那個問題只發生在走快取 entrypoint 的 GET 頁面，
 * POST 一律走沒有快取的路徑，回應會直接交給瀏覽器。
 */
export async function POST(request: Request) {
  let orderNumber: string | undefined;

  try {
    const ecpayParams = await readEcpayParams(request);
    const ecpayResult = await applyEcpayResult(ecpayParams);
    orderNumber = ecpayResult?.orderNumber;
  } catch (error) {
    // 回寫失敗不要卡住消費者：ReturnURL 那條線還會再寫一次，完成頁到時就會變成已付款
    console.error('[ecpay] 處理付款導回失敗', error);
  }

  // 結帳流程的目的地 (成功或失敗)
  // 信用卡付款成功 -> 導向結帳完成頁面
  // 信用卡付款失敗 -> 導向用戶訂單頁面
  const destination = orderNumber
    ? `/checkout/complete/${encodeURIComponent(orderNumber)}`
    : '/user/orders';

  return Response.redirect(new URL(destination, request.url), 303);
}
