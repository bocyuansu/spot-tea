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
import { loginSchema } from '@/features/auth/schemas/login';
/* Better Auth */
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/auth-errors';
/* Nextjs */
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(data: z.infer<typeof loginSchema>) {
    startTransition(async () => {
      await authClient.signIn.email({
        email: data.email,
        password: data.password,
        fetchOptions: {
          onSuccess: () => {
            form.reset();

            toast.add({
              type: 'success',
              description: '登入成功 !',
            });

            router.push('/');
          },
          onError: (ctx) => {
            // console.error(ctx.error);
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
        <CardTitle className="text-3xl">會員登入</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-y-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>電子信箱 (Email)</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    placeholder="example@gmail.com"
                    type="email"
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>密碼 (Password)</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    placeholder="********"
                    type="password"
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Field>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>登入中</span>
                  </>
                ) : (
                  <span>登入</span>
                )}
              </Button>
              {/* <Button variant="outline" type="button">
                Login with Google
              </Button> */}
              <FieldDescription className="text-center">
                沒有帳號？ <Link href="/signup">註冊</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
