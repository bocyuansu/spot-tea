// 只拿來比對 origin，不會真的連線：站內路徑解析完一定還落在這個 origin 底下
const BASE_URL = 'http://localhost';

/**
 * 登入後要回去的路徑來自網址參數，任何人都能竄改，只接受站內路徑。
 *
 * 不自己比對字元：// 與 /\ 會被瀏覽器當成另一個網域（/\ 會被正規化成 //），
 * 而 URL parser 還會先刪掉 tab 與換行，/\t/evil.com 就變成 //evil.com。
 * 交給瀏覽器用的同一套 WHATWG parser 解析，origin 沒變才放行，
 * 並回傳解析後的路徑，確保導過去的就是這裡檢查過的那一個。
 */
export function getSafeRedirectPath(next: string | undefined) {
  if (!next?.startsWith('/')) return '/';

  try {
    const url = new URL(next, BASE_URL);

    if (url.origin !== BASE_URL) return '/';

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}
