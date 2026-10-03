'use client';

/* UI */
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import AuthNoticeCard from '@/features/auth/components/AuthNoticeCard';
/* React Hook Form */
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPasswordSchema } from '@/features/auth/schemas/forgot-password';
/* Better Auth */
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/auth-errors';
/* Nextjs */
import { useState, useTransition, useId } from 'react';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  // label 的 htmlFor 與輸入框的 id，同一頁有多個表單實例也不會撞名
  const formId = useId();

  const [isPending, startTransition] = useTransition();
  // 送出成功後改顯示「請收信」，記下寄到哪個信箱
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(data: z.infer<typeof forgotPasswordSchema>) {
    startTransition(async () => {
      // 不傳 redirectTo：信裡的連結由 lib/auth.ts 用 token 直接組成 /reset-password
      await authClient.requestPasswordReset({
        email: data.email,
        fetchOptions: {
          // 信箱沒註冊也會回成功（防止被拿來查誰有帳號），所以只能說「如果有註冊」
          onSuccess: () => {
            setSentTo(data.email);
          },
          onError: (ctx) => {
            const errorMessage = getErrorMessage(ctx.error.code, 'zh');
            toast.add({
              type: 'error',
              description: errorMessage,
              priority: 'high',
            });
          },
        },
      });
    });
  }

  if (sentTo) {
    return (
      <AuthNoticeCard title="請到信箱收信" href="/login" linkLabel="回到登入">
        如果 {sentTo} 有註冊找茶，重設密碼的連結已經寄出，連結在一小時內有效。
      </AuthNoticeCard>
    );
  }

  return (
    <Card className="w-full max-w-sm mx-auto my-8 [--card-spacing:--spacing(8)]">
      <CardHeader>
        <CardTitle className="text-3xl">忘記密碼</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-y-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={`${formId}-email`}>
                    電子信箱 (Email)
                  </FieldLabel>
                  <Input
                    id={`${formId}-email`}
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="example@gmail.com"
                    type="email"
                    {...field}
                  />
                  <FieldDescription>
                    輸入註冊時使用的信箱，我們會寄一封重設密碼的連結給你
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Field>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>寄送中</span>
                  </>
                ) : (
                  <span>寄送重設連結</span>
                )}
              </Button>
              <FieldDescription className="text-center">
                想起密碼了？ <Link href="/login">登入</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
