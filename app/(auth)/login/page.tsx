import type { Metadata } from 'next';
import LoginForm from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
  title: '會員登入',
  description: '找茶 會員登入',
};

export default function LoginPage() {
  return <LoginForm />;
}
