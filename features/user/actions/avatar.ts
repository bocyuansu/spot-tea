'use server';

import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { client, STORAGE_BUCKET } from '@/lib/s3-client';
import { imageUrl, objectKeyFromUrl } from '@/lib/imagekit';
import { getSession } from '@/lib/session';
import {
  avatarUploadSchema,
  type AvatarUploadInput,
  type AvatarUploadTicket,
} from '@/features/user/schemas/avatar';

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

/**
 * 大頭貼的檔名是 {userId}-{8 碼亂數}.{副檔名}，亂數裡沒有連字號，
 * 最後一個連字號前面整段就是擁有者的 id。是本人上傳的才回傳物件 key，否則 null。
 *
 * Better Auth 的 /update-user 本來就讓使用者自己改 image，
 * 所以刪舊檔前一定要先確認檔案是本人的，不然把 image 指到別人的頭像再換一次，
 * 就能刪掉別人的檔案。
 */
function ownAvatarKey(userId: string, url: string) {
  const key = objectKeyFromUrl('avatars', url);
  if (!key) return null;

  return key.slice('avatars/'.length, key.lastIndexOf('-')) === userId
    ? key
    : null;
}

export async function createAvatarUploadUrl(
  input: AvatarUploadInput,
): Promise<AvatarUploadTicket> {
  const session = await getSession();
  if (!session) return { ok: false, message: '登入狀態已失效，請重新登入 !' };

  const parsed = avatarUploadSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0].message };

  // 每次都換新檔名：ImageKit 依網址快取，沿用同一個檔名會一直看到舊頭像
  const fileName = `${session.user.id}-${crypto.randomUUID().slice(0, 8)}.${extensions[parsed.data.contentType]}`;

  try {
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: `avatars/${fileName}`,
        ContentType: parsed.data.contentType,
        ContentLength: parsed.data.size,
      }),
      // 只夠這次上傳用，不是能一直拿去寫 bucket 的網址
      { expiresIn: 300 },
    );

    return { ok: true, uploadUrl, url: imageUrl('avatars', fileName) };
  } catch {
    return { ok: false, message: '無法取得上傳網址，請稍後再試 !' };
  }
}

/**
 * 新頭像寫進使用者資料之後，把被換掉的那張從 bucket 刪掉。
 *
 * 寫入 image 由瀏覽器呼叫 authClient.updateUser 完成，不在這裡用 auth.api.updateUser：
 * 它會經由 nextCookies() 在 server action 裡寫 session cookie，而 vinext dev 會把
 * next/headers 預先打包出第二份，cookie 寫在那一份上，action 收尾時就會炸掉
 * （mutableCookies[SYNCHRONIZE_REQUEST_COOKIES] is not a function）。
 */
export async function deleteReplacedAvatar(url: string) {
  const session = await getSession();
  if (!session) return;

  // 還在用的不能刪；不是本人上傳的（例如外部網址、別人的頭像）一律不碰
  if (session.user.image === url) return;
  const key = ownAvatarKey(session.user.id, url);
  if (!key) return;

  try {
    await client.send(
      new DeleteObjectCommand({ Bucket: STORAGE_BUCKET, Key: key }),
    );
  } catch {
    // 新頭像已經換好了，這裡刪不掉最多是 bucket 留下沒人用的檔案，
    // 不值得讓使用者看到一次其實成功的更新變成失敗
  }
}
