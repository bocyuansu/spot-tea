'use client';

/* UI */
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
/* React Hook Form */
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { changePasswordSchema } from '@/features/user/schemas/password';
/* Better Auth */
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/auth-errors';
/* Nextjs */
import { useTransition } from 'react';

export default function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  function onSubmit(data: z.infer<typeof changePasswordSchema>) {
    startTransition(async () => {
      await authClient.changePassword({
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
        // 密碼換了就讓其他裝置重新登入，避免舊密碼外流後還能繼續使用
        revokeOtherSessions: true,
        fetchOptions: {
          onSuccess: () => {
            form.reset();

            toast.add({
              type: 'success',
              description: '密碼已更新，其他裝置需要重新登入 !',
            });
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
    <Card className="[--card-spacing:--spacing(6)]">
      <CardHeader>
        <CardTitle className="text-xl">修改密碼</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-y-4">
            <Controller
              name="currentPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>目前的密碼</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    placeholder="********"
                    type="password"
                    autoComplete="current-password"
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>新密碼</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    placeholder="********"
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>確認新密碼</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    placeholder="********"
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                  <span>更新密碼</span>
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
