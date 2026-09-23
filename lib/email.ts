import { Resend } from 'resend';
import { resendEnv } from '@/env';

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

/**
 * 透過 Resend 寄一封信。
 *
 * 呼叫端（lib/auth.ts 的 Better Auth callback）是用 waitUntil 在背景寄，沒有人等得到結果，
 * 而 Resend 失敗時不會 throw，是回 { data, error }，所以錯誤只能記到 Workers Logs。
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const { apiKey, from } = resendEnv();
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({ from, to, subject, html });

  if (error) {
    console.error('[email] 寄信失敗', error);
  }
}
