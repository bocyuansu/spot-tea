/**
 * 登入後要回去的路徑來自網址參數，任何人都能竄改，只接受站內路徑。
 * // 與 /\ 開頭都會被瀏覽器當成另一個網域（/\ 會被正規化成 //），變成 open redirect。
 */
export function getSafeRedirectPath(next: string | undefined) {
  return next && /^\/(?![/\\])/.test(next) ? next : '/';
}
