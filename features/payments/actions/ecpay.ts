'use server';

import { headers } from 'next/headers';
import { getDatabase } from '@/db/client';
import { createAuth } from '@/lib/auth';
import { ecpayEnv } from '@/env';
import {
  ECPAY_CHECKOUT_URLS,
  buildItemName,
  buildMerchantTradeNo,
  formatMerchantTradeDate,
  generateCheckMacValue,
  type EcpayParams,
} from '@/features/payments/ecpay';

export type StartEcpayPaymentResult =
  | { ok: true; action: string; fields: EcpayParams }
  | { ok: false; message: string };

/**
 * 為一張尚未付款的綠界訂單產生送單參數，由 client 組成表單 POST 到綠界付款頁。
 *
 * 官方規定必須由消費者的瀏覽器 submit 到綠界（不能 server 代送、不能用 iframe），
 * 所以這裡只負責算出帶 CheckMacValue 的欄位；HashKey / HashIV 不會離開 server。
 * 金額與品項一律從資料庫讀，client 只送訂單編號。
 */
export async function startEcpayPayment(orderNumber: string): Promise<StartEcpayPaymentResult> {
  const auth = await createAuth();
  const requestHeaders = await headers();

  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) return { ok: false, message: '請先登入再付款 !' };

  const db = await getDatabase('fresh');

  // 回呼網址跟著使用者實際造訪的網域走：瀏覽器送出的 server action 一定帶 Origin，
  // 本機用 tunnel 測試時也會自動變成 tunnel 的網址（綠界只能打 80/443 的公開網址）
  const origin = requestHeaders.get('origin');
  if (!origin) return { ok: false, message: '無法建立付款，請重新整理後再試 !' };

  // 綁著 userId 查，別人的訂單編號自然查不到
  const order = await db.query.order.findFirst({
    where: { userId: session.user.id, orderNumber },
    with: { items: true },
  });

  if (!order || order.paymentProvider !== 'ecpay') {
    return { ok: false, message: '找不到這筆訂單 !' };
  }
  if (order.paymentStatus === 'paid') return { ok: false, message: '這筆訂單已經付款完成 !' };
  if (order.status === 'cancelled') return { ok: false, message: '這筆訂單已取消，無法付款 !' };

  const { merchantId, hashKey, hashIv, mode } = ecpayEnv();

  const params: EcpayParams = {
    MerchantID: merchantId,
    MerchantTradeNo: buildMerchantTradeNo(order.orderNumber),
    MerchantTradeDate: formatMerchantTradeDate(new Date()),
    PaymentType: 'aio',
    TotalAmount: String(order.totalAmount),
    TradeDesc: '找茶線上購物',
    ItemName: buildItemName(order.items),
    // ReturnURL 是綠界 server 對 server 的通知，OrderResultURL 是把消費者帶回來的前景導轉，
    // 官方明令兩者不可設成同一個網址
    ReturnURL: `${origin}/api/payments/ecpay/notify`,
    OrderResultURL: `${origin}/api/payments/ecpay/result`,
    ClientBackURL: `${origin}/checkout/complete/${order.orderNumber}`,
    // 固定信用卡：官方建議指定付款方式，ALL 會在綠界新增付款方式時冒出沒處理過的流程
    ChoosePayment: 'Credit',
    EncryptType: '1',
    // 通知回來時用它找回訂單；它也在 CheckMacValue 的保護範圍內，無法被竄改
    CustomField1: order.orderNumber,
  };

  params.CheckMacValue = await generateCheckMacValue(params, hashKey, hashIv);

  return { ok: true, action: ECPAY_CHECKOUT_URLS[mode], fields: params };
}
