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
import { updateProfileSchema } from '@/features/user/schemas/profile';
/* Better Auth */
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/auth-errors';
/* Nextjs */
import { useTransition, useId } from 'react';
import { useRouter } from 'next/navigation';

type ProfileFormProps = {
  defaultName: string;
};

export default function ProfileForm({ defaultName }: ProfileFormProps) {
  // label 的 htmlFor 與輸入框的 id，同一頁有多個表單實例也不會撞名
  const formId = useId();

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: defaultName,
    },
  });

  function onSubmit(data: z.infer<typeof updateProfileSchema>) {
    startTransition(async () => {
      await authClient.updateUser({
        name: data.name,
        fetchOptions: {
          onSuccess: () => {
            // 送出的值成為新的初始值，isDirty 才會回到 false
            form.reset({ name: data.name });

            toast.add({
              type: 'success',
              description: '個人資料已更新 !',
            });

            // 頁面上的會員資訊由 server component 提供，重新取一次才會同步
            router.refresh();
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
        <CardTitle className="text-xl">個人資料</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-y-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={`${formId}-name`}>用戶名稱</FieldLabel>
                  <Input
                    id={`${formId}-name`}
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                    placeholder="username"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Field>
              <FieldDescription>電子信箱註冊後無法修改</FieldDescription>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>儲存中</span>
                  </>
                ) : (
                  <span>儲存變更</span>
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
