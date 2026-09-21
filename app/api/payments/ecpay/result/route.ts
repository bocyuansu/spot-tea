import { applyEcpayResult, readEcpayParams } from '@/features/payments/ecpay-result';

/**
 * 綠界 OrderResultURL：消費者付款後，綠界付款頁以 form POST 把瀏覽器帶回這裡。
 *
 * 頁面收不了 POST，所以先在這裡驗證並回寫，再用 303 轉成 GET 導到訂單完成頁。
 * 這個 303 不會踩到 proxy.ts 說的無限轉址：那個問題只發生在走快取 entrypoint 的 GET 頁面，
 * POST 一律走沒有快取的路徑，回應會直接交給瀏覽器。
 */
export async function POST(request: Request) {
  let ecpayResult: Awaited<ReturnType<typeof applyEcpayResult>> = null;

  try {
    const ecpayParams = await readEcpayParams(request);
    ecpayResult = await applyEcpayResult(ecpayParams);
  } catch (error) {
    // 回寫失敗不要卡住消費者：ReturnURL 那條線還會再寫一次，完成頁到時就會變成已付款
    console.error('[ecpay] 處理付款導回失敗', error);
  }

  // 驗證通過就回到那張訂單的完成頁，不論付款成敗：沒付成功時訂單仍是未付款，
  // 完成頁會顯示付款卡片讓消費者重付，payment=incomplete 讓它多說明這次沒有完成。
  // 驗證失敗或回寫出錯時不知道是哪張訂單，只能導到「我的訂單」
  if (!ecpayResult) {
    return Response.redirect(new URL('/user/orders', request.url), 303);
  }

  const destination = new URL(
    `/checkout/complete/${encodeURIComponent(ecpayResult.orderNumber)}`,
    request.url,
  );
  if (!ecpayResult.succeeded) destination.searchParams.set('payment', 'incomplete');

  return Response.redirect(destination, 303);
}
