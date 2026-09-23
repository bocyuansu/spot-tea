import type { SecondaryStorage } from 'better-auth';
import { env } from 'cloudflare:workers';

// Cloudflare KV 的 expirationTtl 最少 60 秒，比這短會直接丟錯；
// session 快到期時 Better Auth 算出的剩餘秒數可能不到 60，讀取時它仍會比對 expiresAt
const KV_MIN_TTL_SECONDS = 60;

export const kvSecondaryStorage: SecondaryStorage = {
  get(key) {
    return env.AUTH_KV.get(key);
  },
  async set(key, value, ttl) {
    await env.AUTH_KV.put(
      key,
      value,
      ttl ? { expirationTtl: Math.max(ttl, KV_MIN_TTL_SECONDS) } : undefined,
    );
  },
  async delete(key) {
    await env.AUTH_KV.delete(key);
  },
  // KV 沒有原子操作，用 get + delete 湊會讓一次性的驗證碼可以被重放。
  // lib/auth.ts 已設定 verification.storeInDatabase，這裡不應被呼叫
  getAndDelete() {
    throw new Error(
      'KV secondary storage 不支援 getAndDelete，請設定 verification.storeInDatabase: true',
    );
  },
  // 同上，lib/auth.ts 已設定 rateLimit.storage: 'memory'
  increment() {
    throw new Error(
      "KV secondary storage 不支援 increment，請設定 rateLimit.storage: 'memory'",
    );
  },
};
