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
  adminUpdateUserSchema,
  adminUserRoleLabels,
  adminUserStatusLabels,
  type AdminUpdateUserValues,
} from '@/features/admin/users/schemas/user';
/* Better Auth */
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/auth-errors';
/* Nextjs */
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { user as userTable } from '@/db/schema';

type UserEditFormProps = {
  user: typeof userTable.$inferSelect;
  // 管理員不能把自己降級或停權，否則會把自己鎖在後台外面
  isSelf: boolean;
};

export default function UserEditForm({ user, isSelf }: UserEditFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(adminUpdateUserSchema),
    defaultValues: {
      name: user.name,
      role: user.role === 'admin' ? ('admin' as const) : ('customer' as const),
      status: user.banned ? ('banned' as const) : ('active' as const),
    },
  });

  function onSubmit(values: AdminUpdateUserValues) {
    startTransition(async () => {
      // 角色與停權各自有專屬的端點（停權會一併撤銷登入中的 session），所以分開送
      const steps = [
        () => authClient.admin.updateUser({ userId: user.id, data: { name: values.name } }),
        () => authClient.admin.setRole({ userId: user.id, role: values.role }),
        () =>
          values.status === 'banned'
            ? authClient.admin.banUser({ userId: user.id })
            : authClient.admin.unbanUser({ userId: user.id }),
      ];

      for (const step of steps) {
        const { error } = await step();

        if (error) {
          toast.add({
            type: 'error',
            description: getErrorMessage(error.code ?? '', 'zh'),
            priority: 'high',
          });
          return;
        }
      }

      toast.add({ type: 'success', description: '會員資料已更新 !' });

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

            <Field>
              <FieldLabel>電子信箱</FieldLabel>
              <Input value={user.email} readOnly disabled />
              <FieldDescription>電子信箱註冊後無法修改</FieldDescription>
            </Field>

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
                    disabled={isSelf}
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
                  {isSelf && <FieldDescription>不能變更自己的角色</FieldDescription>}
                </Field>
              )}
            />

            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>狀態</FieldLabel>
                  <Select
                    items={adminUserStatusLabels}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? 'active')}
                    disabled={isSelf}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(adminUserStatusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {isSelf ? '不能停權自己的帳號' : '停權會同時把該會員登入中的裝置登出'}
                  </FieldDescription>
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
              <span>儲存中</span>
            </>
          ) : (
            <span>儲存變更</span>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/users')}>
          取消
        </Button>
      </div>
    </form>
  );
}
