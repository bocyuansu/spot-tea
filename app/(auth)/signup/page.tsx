import type { Metadata } from 'next';
import SignUpForm from '@/features/auth/components/SignUpForm';

export const metadata: Metadata = {
  title: '註冊會員',
  description: '找茶 註冊會員',
};

export default function SignUpPage() {
  return <SignUpForm />;
}
