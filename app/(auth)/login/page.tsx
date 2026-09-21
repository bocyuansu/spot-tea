import type { Metadata } from 'next';
import LoginForm from '@/features/auth/components/LoginForm';
import { getSafeRedirectPath } from '@/features/auth/safe-redirect';

export const metadata: Metadata = {
  title: '會員登入',
  description: '找茶 會員登入',
};

type LoginPageProps = {
  // proxy.ts 把沒登入的訪客帶來時，會把原本要去的路徑放在 next
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return <LoginForm redirectTo={getSafeRedirectPath(next)} />;
}
