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
/* React Hook Form */
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPasswordSchema } from '@/features/auth/schemas/reset-password';
/* Better Auth */
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/auth-errors';
/* Nextjs */
import { useTransition, useId } from 'react';
import { useRouter } from 'next/navigation';

type ResetPasswordFormProps = {
  // 重設密碼信裡的 token，由 reset-password/page.tsx 從 query string 取出
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  // label 的 htmlFor 與輸入框的 id，同一頁有多個表單實例也不會撞名
  const formId = useId();

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  function onSubmit(data: z.infer<typeof resetPasswordSchema>) {
    startTransition(async () => {
      await authClient.resetPassword({
        newPassword: data.newPassword,
        token,
        fetchOptions: {
          onSuccess: () => {
            form.reset();

            toast.add({
              type: 'success',
              description: '密碼已重設，請用新密碼登入 !',
            });

            router.push('/login');
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

  return (
    <Card className="w-full max-w-sm mx-auto my-8 [--card-spacing:--spacing(8)]">
      <CardHeader>
        <CardTitle className="text-3xl">重設密碼</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-y-4">
            <Controller
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={`${formId}-newPassword`}>
                    新密碼
                  </FieldLabel>
                  <Input
                    id={`${formId}-newPassword`}
                    aria-invalid={fieldState.invalid}
                    placeholder="********"
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={`${formId}-confirmPassword`}>
                    確認新密碼
                  </FieldLabel>
                  <Input
                    id={`${formId}-confirmPassword`}
                    aria-invalid={fieldState.invalid}
                    placeholder="********"
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Field>
              <FieldDescription>密碼長度至少 8 碼</FieldDescription>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>更新中</span>
                  </>
                ) : (
                  <span>重設密碼</span>
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
