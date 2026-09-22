/**
 * Better Auth 預設的 scrypt（N=16384, r=16）在 workerd 會吃掉數百 ms CPU，
 * 而 Free 方案每次請求只有 10ms，登入必爆 Cloudflare Error 1102。
 * 改用 workerd 原生的 Web Crypto PBKDF2，由 emailAndPassword.password 覆寫掛進 lib/auth.ts。
 *
 * ⚠️ ITERATIONS 不能超過 100_000 —— workerd 的硬性上限，超過會丟 NotSupportedError。
 * 這個上限只在 production 生效，wrangler dev 和 Node 都不會擋，本機測不出來。
 *
 * hash 格式沿用 Django 風格的 `pbkdf2_sha256$<iterations>$<salt-hex>$<key-hex>`，
 * 迭代次數存在 hash 裡，之後調整 ITERATIONS 不會讓已註冊的密碼失效。
 */
const ALGORITHM = 'pbkdf2_sha256';
const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);

  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  return bytes;
}

// 逐字元累加而不提早 return，避免從比對耗時推回 key 的前綴
function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;

  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return diff === 0;
}

// salt 標成 Uint8Array<ArrayBuffer>：BufferSource 不收可能背靠 SharedArrayBuffer 的 Uint8Array
async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
) {
  const key = await crypto.subtle.importKey(
    'raw',
    // NFKC 沿用 Better Auth 預設實作，同一個密碼的不同 Unicode 正規化形式才驗得過
    new TextEncoder().encode(password.normalize('NFKC')),
    'PBKDF2',
    false, // PBKDF2 的 key 必須 non-extractable
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    KEY_BITS,
  );

  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await deriveKey(password, salt, ITERATIONS);

  return `${ALGORITHM}$${ITERATIONS}$${toHex(salt)}$${toHex(key)}`;
}

export async function verifyPassword(data: { hash: string; password: string }) {
  const [algorithm, iterations, salt, key] = data.hash.split('$');

  // 格式不符就回 false 而不是 throw —— throw 會變成 500，回 false 才會走
  // Better Auth 正常的「密碼錯誤」流程
  if (algorithm !== ALGORITHM || !iterations || !salt || !key) {
    return false;
  }

  const target = await deriveKey(
    data.password,
    fromHex(salt),
    Number(iterations),
  );

  return timingSafeEqual(toHex(target), key);
}
