/**
 * 用 Better Auth callback 給的 token 組出站內頁面的連結。
 *
 * Better Auth 給的 url 指向 /api/auth/verify-email 與 /api/auth/reset-password/:token，
 * 這兩個 GET 端點會用 302 轉回站內頁面；但 GET 會走 vinext 的快取 entrypoint，
 * 302 會被 Worker 自己追下去，變成 1101 Too many redirects（見 proxy.ts 的說明）。
 * 所以直接把信裡的連結指向頁面，再由頁面呼叫不會轉址的 API。
 *
 * url 的 origin 就是這次請求的 host（lib/auth.ts 的 baseURL 由 allowedHosts 動態決定），
 * 所以本機、preview 與正式站都會寄出各自的網址。
 */
export function authPageUrl(url: string, pathname: string, token: string) {
  const link = new URL(pathname, url);
  link.searchParams.set('token', token);

  return link.toString();
}

// 信裡不放使用者名稱：名稱是使用者自己填的，不塞進 HTML 就不用擔心跳脫

export function verificationEmail(link: string) {
  return {
    subject: '【找茶】請驗證你的電子信箱',
    html: `
      <p>感謝你註冊找茶！</p>
      <p>請點擊下方連結完成信箱驗證，連結在一小時內有效：</p>
      <p><a href="${link}">驗證我的信箱</a></p>
      <p>如果你沒有註冊找茶，請忽略這封信。</p>
    `,
  };
}

export function resetPasswordEmail(link: string) {
  return {
    subject: '【找茶】重設密碼',
    html: `
      <p>我們收到了重設找茶帳號密碼的申請。</p>
      <p>請點擊下方連結設定新密碼，連結在一小時內有效：</p>
      <p><a href="${link}">重設密碼</a></p>
      <p>如果不是你本人申請，請忽略這封信，你的密碼不會改變。</p>
    `,
  };
}
