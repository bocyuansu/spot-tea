import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

/**
 * 會員頁與後台的登入判斷、以及 /admin 到儀表板的轉址都放在這裡，
 * 而不是頁面裡的 redirect()。
 *
 * Cloudflare 的 vinext CDN adapter 會把頁面渲染丟給 VinextCachedResponse 這個
 * entrypoint，而它發出的內部 request 是 redirect: 'follow'，所以頁面回傳的 307
 * 會被 Worker 自己追下去、再重新渲染同一頁，最後撞上轉址上限變成 1101。
 * proxy 跑在沒有快取的 default entrypoint，轉址會直接回給瀏覽器。
 */
export function proxy(request: NextRequest) {
  // 只樂觀檢查 cookie 是否存在，真正的 session 驗證仍由頁面的 getSession 負責
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // /admin 本身沒有內容，進來就帶到儀表板
  if (request.nextUrl.pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/user/:path*', '/admin/:path*', '/checkout/:path*'],
};
