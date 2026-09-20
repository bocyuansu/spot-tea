export const ORDER_NUMBER_PREFIX = 'ST';

/**
 * 訂單編號是 ST-YYYYMMDD-NNNN，序號每天從 0001 重新開始。
 *
 * Worker 跑在 UTC，直接用 getFullYear() 這類方法會讓台北凌晨的訂單拿到前一天的日期，
 * 所以日期一律以 Asia/Taipei 計算。en-CA 的輸出剛好是 YYYY-MM-DD。
 */
export function formatOrderDateStamp(date: Date) {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

  return formatted.replaceAll('-', '');
}

// 查當天最後一筆訂單時用的 LIKE 前綴
export function buildOrderNumberPrefix(stamp: string) {
  return `${ORDER_NUMBER_PREFIX}-${stamp}-`;
}

export function buildOrderNumber(stamp: string, sequence: number) {
  // padStart 不會截斷，單日超過 9999 筆會變成 5 位數。
  // 注意：查當天最後一筆是用 ORDER BY order_number DESC（字串排序），
  // 而 'ST-…-10000' 會排在 'ST-…-9999' 前面，所以真的破萬時序號會算錯並一直撞到
  // unique 限制。要支援那個量級的話，得改用 createdAt 排序或加寬補零位數。
  return `${buildOrderNumberPrefix(stamp)}${String(sequence).padStart(4, '0')}`;
}

// 當天還沒有訂單、或舊編號格式不對時都從 1 開始
export function nextOrderSequence(latest: string | undefined) {
  const sequence = Number(latest?.split('-').at(-1));

  return Number.isInteger(sequence) && sequence > 0 ? sequence + 1 : 1;
}
