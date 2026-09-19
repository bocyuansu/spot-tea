'use client';

/* UI */
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
/* React Hook Form */
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  adminCreateUserSchema,
  adminUserRoleLabels,
  type AdminCreateUserValues,
} from '@/features/admin/users/schemas/user';
/* Better Auth */
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/auth-errors';
/* Nextjs */
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function UserCreateForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'customer' as const,
    },
  });

  function onSubmit(values: AdminCreateUserValues) {
    startTransition(async () => {
      // 後台建立會員走 admin plugin 的端點，它會自己確認呼叫者是不是管理員
      const { error } = await authClient.admin.createUser(values);

      if (error) {
        toast.add({
          type: 'error',
          description: getErrorMessage(error.code ?? '', 'zh'),
          priority: 'high',
        });
        return;
      }

      toast.add({ type: 'success', description: '會員已建立 !' });

      router.push('/admin/users');
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card className="[--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle className="text-xl">會員資料</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-y-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>用戶名稱</FieldLabel>
                  <Input aria-invalid={fieldState.invalid} placeholder="username" {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>電子信箱</FieldLabel>
                  <Input
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="user@example.com"
                    {...field}
                  />
                  <FieldDescription>建立之後無法修改</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>密碼</FieldLabel>
                  <Input type="password" aria-invalid={fieldState.invalid} {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="role"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>角色</FieldLabel>
                  <Select
                    items={adminUserRoleLabels}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? 'customer')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(adminUserRoleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>建立中</span>
            </>
          ) : (
            <span>建立會員</span>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/users')}>
          取消
        </Button>
      </div>
    </form>
  );
}
