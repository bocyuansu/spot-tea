import type { Metadata } from 'next';
import AuthNoticeCard from '@/features/auth/components/AuthNoticeCard';
import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm';

export const metadata: Metadata = {
  title: '重設密碼',
  description: '找茶 重設密碼',
};

type ResetPasswordPageProps = {
  // 重設密碼信的連結由 features/auth/emails.ts 組出，token 放在 query string
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  // token 是否有效要送出時才知道，這裡只擋掉根本沒帶 token 的情況
  if (!token) {
    return (
      <AuthNoticeCard
        title="重設連結無效"
        href="/forgot-password"
        linkLabel="重新申請"
      >
        這個連結缺少必要的資訊，請重新申請一封重設密碼的信。
      </AuthNoticeCard>
    );
  }

  return <ResetPasswordForm token={token} />;
}
