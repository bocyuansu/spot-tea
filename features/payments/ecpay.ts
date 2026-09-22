/**
 * 綠界全方位金流（AIO）的共用工具：CheckMacValue、交易編號與送單參數。
 *
 * 規格來源：https://developers.ecpay.com.tw/2862.md（產生訂單）、
 * https://developers.ecpay.com.tw/2878.md（付款結果通知），2026-09-21 web_fetch。
 * CheckMacValue 演算法對應官方 PHP SDK 的 CheckMacValueService / UrlService::ecpayUrlEncode。
 *
 * 只用 Web Crypto，不碰 node:crypto：Worker 與 vitest（Node）兩邊都跑得動。
 */

export type EcpayParams = Record<string, string>;

export const ECPAY_CHECKOUT_URLS = {
  stage: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
  production: 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5',
} as const;

export type EcpayMode = keyof typeof ECPAY_CHECKOUT_URLS;

// MerchantTradeNo 最長 20 字、只收英數字，而且永久不能重複
const MERCHANT_TRADE_NO_LENGTH = 20;
const TRADE_NO_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// 官方上限 400 字，但截斷處的中文會變亂碼、讓兩邊算出的 CheckMacValue 對不上而掉單，官方建議 200 字內
const ITEM_NAME_MAX_LENGTH = 200;

/**
 * 對應 PHP 的 urlencode → strtolower → .NET 字元還原。
 *
 * encodeURIComponent 和 PHP urlencode 有三處不同要補：空格是 %20 而非 +，
 * 另外不編碼 ~ 和 '。其餘 !*() 它本來就不編碼，剛好等於 .NET 還原後的結果。
 */
export function ecpayUrlEncode(source: string) {
  return encodeURIComponent(source)
    .replaceAll('%20', '+')
    .replaceAll('~', '%7e')
    .replaceAll("'", '%27')
    .toLowerCase()
    .replaceAll('%2d', '-')
    .replaceAll('%5f', '_')
    .replaceAll('%2e', '.')
    .replaceAll('%21', '!')
    .replaceAll('%2a', '*')
    .replaceAll('%28', '(')
    .replaceAll('%29', ')');
}

export async function generateCheckMacValue(
  params: EcpayParams,
  hashKey: string,
  hashIv: string,
) {
  // PHP SDK 用 strcasecmp 排序：比的是轉小寫後的位元組順序，不能用會看 locale 的 localeCompare
  const query = Object.keys(params)
    .filter((key) => key !== 'CheckMacValue')
    .sort((a, b) => {
      const left = a.toLowerCase();
      const right = b.toLowerCase();

      return left < right ? -1 : left > right ? 1 : 0;
    })
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  const encoded = ecpayUrlEncode(
    `HashKey=${hashKey}&${query}&HashIV=${hashIv}`,
  );
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(encoded),
  );

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  )
    .join('')
    .toUpperCase();
}

// 比對檢查碼不能用 ===：它一遇到不同字元就提早結束，回應時間會洩漏比對到第幾個字
function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return diff === 0;
}

export async function verifyCheckMacValue(
  params: EcpayParams,
  hashKey: string,
  hashIv: string,
) {
  const expected = await generateCheckMacValue(params, hashKey, hashIv);

  return timingSafeEqual((params.CheckMacValue ?? '').toUpperCase(), expected);
}

/**
 * 同一張訂單付款失敗後可以重付，但綠界的 MerchantTradeNo 用過就不能再用，
 * 所以每次送單都用「去掉連字號的訂單編號 + 隨機尾碼」湊滿 20 字。
 * 回查訂單不靠拆這個字串，而是送單時把訂單編號放在 CustomField1。
 */
export function buildMerchantTradeNo(orderNumber: string) {
  const base = orderNumber.replace(/[^A-Za-z0-9]/g, '');
  const suffixLength = Math.max(MERCHANT_TRADE_NO_LENGTH - base.length, 0);
  const randomBytes = crypto.getRandomValues(new Uint8Array(suffixLength));
  const suffix = Array.from(
    randomBytes,
    (byte) => TRADE_NO_ALPHABET[byte % TRADE_NO_ALPHABET.length],
  ).join('');

  return `${base}${suffix}`.slice(0, MERCHANT_TRADE_NO_LENGTH);
}

/** MerchantTradeDate 要台灣時間的 yyyy/MM/dd HH:mm:ss；Worker 跑在 UTC，不能直接用 getHours() */
export function formatMerchantTradeDate(date: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );

  return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

type ItemNameSource = {
  productName: string;
  variantName: string;
  quantity: number;
};

/**
 * 多項商品以 # 分隔，所以品名本身的 # 要拿掉；綠界不收 html tag 與特殊符號，
 * CDN 也會擋分號、pipe、反引號這類 shell 字元，一併濾掉。
 * 以 code point 截斷，才不會把中文字切成半個。
 */
export function buildItemName(items: ItemNameSource[]) {
  const itemName = items
    .map((item) =>
      `${item.productName} ${item.variantName} x${item.quantity}`.replace(
        /[#<>&;|`'"\\%\p{Cc}]/gu,
        '',
      ),
    )
    .join('#');

  return Array.from(itemName).slice(0, ITEM_NAME_MAX_LENGTH).join('');
}
