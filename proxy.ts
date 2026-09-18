import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

/**
 * 會員頁的登入判斷放在這裡，而不是頁面裡的 redirect()。
 *
 * Cloudflare 的 vinext CDN adapter 會把頁面渲染丟給 VinextCachedResponse 這個
 * entrypoint，而它發出的內部 request 是 redirect: 'follow'，所以頁面回傳的 307
 * 會被 Worker 自己追下去、再重新渲染同一頁，最後撞上轉址上限變成 1101。
 * proxy 跑在沒有快取的 default entrypoint，轉址會直接回給瀏覽器。
 */
export function proxy(request: NextRequest) {
  // 只樂觀檢查 cookie 是否存在，真正的 session 驗證仍由頁面的 getSession 負責
  if (getSessionCookie(request)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/user/:path*'],
};
