import type { Metadata } from 'next';
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: '忘記密碼',
  description: '找茶 忘記密碼',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
