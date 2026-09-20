import { cache } from 'react';
import { headers } from 'next/headers';
import { createAuth } from '@/lib/auth';

/**
 * 每個請求只建立一次 auth 實例、只讀一次 session。
 *
 * 前台每一頁都會渲染 SiteChrome → Navbar，而 Navbar 需要登入狀態；頁面本身通常也要。
 * 各自呼叫 createAuth() 的話，一個請求就會開好幾個 pg client（createAuth 內部會
 * getDatabase()）並重複查同一份 session —— Cloudflare Free 方案每請求只有 10ms CPU，
 * 這是最不值得花的地方。
 *
 * React 的 cache() 以請求為範圍做記憶化，整棵 RSC 樹共用同一次結果。
 *
 * 只給 server component 用。server action 與 route handler 仍各自呼叫 createAuth()：
 * 它們本來就只讀一次，沒有要去重的對象。
 */
export const getAuth = cache(createAuth);

export const getSession = cache(async () => {
  const auth = await getAuth();

  return auth.api.getSession({ headers: await headers() });
});
