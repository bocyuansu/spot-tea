/**
 * 後台 server action 的統一回傳格式。
 * 'use server' 檔案只能 export async function，所以型別放在這裡而不是各自的 action 裡。
 */
export type ActionResult = { ok: true } | { ok: false; message: string };
