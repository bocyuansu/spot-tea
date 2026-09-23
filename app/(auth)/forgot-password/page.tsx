import type { Metadata } from 'next';
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';
import AuthNoticeCard from '@/features/auth/components/AuthNoticeCard';

export const metadata: Metadata = {
  title: '忘記密碼',
  description: '找茶 忘記密碼',
};

export default function ForgotPasswordPage() {
  const closeFeature = true;

  if (closeFeature) {
    return (
      <AuthNoticeCard
        title="目前無自訂網域，暫時關閉功能"
        href="/login"
        linkLabel="回登入頁面"
      >
        請點擊按鈕回到登入頁面。
      </AuthNoticeCard>
    );
  }

  return <ForgotPasswordForm />;
}
