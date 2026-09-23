import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { isAPIError } from 'better-auth/api';
import AuthNoticeCard from '@/features/auth/components/AuthNoticeCard';
import { getAuth } from '@/lib/session';

export const metadata: Metadata = {
  title: '驗證信箱',
  description: '找茶 驗證信箱',
};

type VerifyEmailPageProps = {
  // 驗證信的連結由 features/auth/emails.ts 組出，token 放在 query string
  searchParams: Promise<{ token?: string }>;
};

// 使用者手上的連結本身有問題時，Better Auth 丟出的錯誤碼
const invalidLinkCodes = new Set([
  'INVALID_TOKEN',
  'TOKEN_EXPIRED',
  'USER_NOT_FOUND',
]);

async function verifyEmailToken(token: string) {
  const auth = await getAuth();

  try {
    // 不帶 callbackURL 就不會轉址，只回 JSON。
    // headers 一定要傳：lib/auth.ts 的 baseURL 是依請求的 host 動態決定的，
    // 直接呼叫 auth.api 沒有 headers 的話，Better Auth 無從判斷網域而直接報錯
    await auth.api.verifyEmail({ query: { token }, headers: await headers() });
    return true;
  } catch (error) {
    if (isAPIError(error) && invalidLinkCodes.has(error.body?.code ?? '')) {
      return false;
    }
    // 其他錯誤不是連結的問題，不要偽裝成「連結無效」，交給 error boundary
    throw error;
  }
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;
  const verified = token ? await verifyEmailToken(token) : false;

  if (!verified) {
    return (
      <AuthNoticeCard title="驗證連結無效" href="/login" linkLabel="前往登入">
        連結可能已經過期。請重新登入，系統會再寄一封驗證信給你。
      </AuthNoticeCard>
    );
  }

  return (
    <AuthNoticeCard title="信箱驗證成功" href="/login" linkLabel="前往登入">
      你的信箱已完成驗證，現在可以登入找茶了。
    </AuthNoticeCard>
  );
}
