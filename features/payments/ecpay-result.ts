import { and, eq } from 'drizzle-orm';
import { getDatabase } from '@/db/client';
import { order } from '@/db/schema';
import { ecpayEnv } from '@/env';
import { verifyCheckMacValue, type EcpayParams } from '@/features/payments/ecpay';

/** 綠界的回呼都是 application/x-www-form-urlencoded，檔案欄位不會出現，只留字串 */
export async function readEcpayParams(request: Request): Promise<EcpayParams> {
  const formData = await request.formData();

  return Object.fromEntries(
    [...formData.entries()].filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );
}

/**
 * 驗證綠界的付款結果並回寫訂單，ReturnURL 與 OrderResultURL 共用。
 *
 * 兩者帶的欄位與 CheckMacValue 完全相同，而且官方不保證誰先到，
 * 所以哪一個先進來就由哪一個回寫；消費者被導回完成頁時就能看到已付款。
 * 驗證不過回 null，呼叫端不該相信 params 裡的任何內容。
 *
 * 規格：https://developers.ecpay.com.tw/2878.md（2026-09-21 web_fetch）
 */
export async function applyEcpayResult(params: EcpayParams) {
  const { merchantId, hashKey, hashIv } = ecpayEnv();

  if (!(await verifyCheckMacValue(params, hashKey, hashIv)) || params.MerchantID !== merchantId) {
    console.error('[ecpay] CheckMacValue 或 MerchantID 驗證失敗', params.MerchantTradeNo);
    return null;
  }

  const orderNumber = params.CustomField1;

  // AIO 的 RtnCode 走 form POST，是字串 '1'。其他代碼（例如 10300066 待確認）
  // 不代表一定失敗，官方要求人工到後台確認，所以只處理成功，不把訂單標成 failed
  if (params.RtnCode !== '1') {
    console.warn('[ecpay] 付款未成功', orderNumber, params.RtnCode, params.RtnMsg);
    return { orderNumber };
  }

  // SimulatePaid=1 是綠界後台按「模擬付款」產生的通知，沒有真的收到錢，官方明言不可出貨
  if (params.SimulatePaid === '1') {
    console.warn('[ecpay] 收到模擬付款通知，不更新訂單', orderNumber);
    return { orderNumber };
  }

  const db = await getDatabase('fresh');

  // 冪等：綠界最多會重送 4 次，而 ReturnURL 與 OrderResultURL 也會各來一次，
  // 帶上 paymentStatus = 'unpaid' 讓重複的通知命中 0 列。
  // 金額也要對得上，防止拿一筆小額交易的通知去標記大額訂單
  const [updated] = await db
    .update(order)
    .set({ paymentStatus: 'paid', paymentTransactionId: params.TradeNo })
    .where(
      and(
        eq(order.orderNumber, orderNumber),
        eq(order.paymentProvider, 'ecpay'),
        eq(order.paymentStatus, 'unpaid'),
        eq(order.totalAmount, Number(params.TradeAmt)),
      ),
    )
    .returning({ id: order.id });

  if (!updated) {
    // 多半是重送的通知；若訂單其實還是未付款，就是金額對不上，需要人工查帳
    console.warn('[ecpay] 付款通知沒有更新任何訂單', orderNumber, params.TradeNo, params.TradeAmt);
  }

  return { orderNumber };
}
