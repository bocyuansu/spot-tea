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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
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
  type AdminUpdateUserValues,
} from '@/features/admin/users/schemas/user';
/* Better Auth */
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/auth-errors';
/* Nextjs */
import { useTransition, useId } from 'react';
import { useRouter } from 'next/navigation';
import { useUserDialog } from '@/features/admin/users/components/UserActionsProvider';
import type { AdminUser } from '@/db/queries/admin/users';

function toFormDefault(user: AdminUser): AdminUpdateUserValues {
  return {
    name: user.name,
    role: user.role === 'admin' ? 'admin' : 'customer',
  };
}

export default function UserEditDialog() {
  // label 的 htmlFor 與輸入框的 id，同一頁有多個表單實例也不會撞名
  const formId = useId();

  // 管理員不能把自己降級，否則會把自己鎖在後台外面
  const { user, isSelf, open, onOpenChange } = useUserDialog('edit');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(adminUpdateUserSchema),
    defaultValues: toFormDefault(user),
  });

  function handleOpenChange(isOpen: boolean) {
    // 關閉 Dialog 就清除表單
    if (!isOpen) form.reset(toFormDefault(user));
    onOpenChange(isOpen);
  }

  function onSubmit(values: AdminUpdateUserValues) {
    const { name, role } = values;
    startTransition(async () => {
      // 角色有專屬的端點，所以跟基本資料分開送
      const steps = [
        () => authClient.admin.updateUser({ userId: user.id, data: { name } }),
        () => authClient.admin.setRole({ userId: user.id, role }),
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

      onOpenChange(false);
      toast.add({ type: 'success', description: '會員資料已更新 !' });
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>編輯會員</DialogTitle>
            <DialogDescription>{user.email}</DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-y-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={`${formId}-name`}>用戶名稱</FieldLabel>
                  <Input
                    id={`${formId}-name`}
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
              <FieldLabel htmlFor={`${formId}-email`}>電子信箱</FieldLabel>
              <Input
                id={`${formId}-email`}
                value={user.email}
                readOnly
                disabled
              />
              <FieldDescription>電子信箱註冊後無法修改</FieldDescription>
            </Field>

            <Controller
              name="role"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={`${formId}-role`}>角色</FieldLabel>
                  <Select
                    items={adminUserRoleLabels}
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value ?? 'customer')
                    }
                    disabled={isSelf}
                  >
                    <SelectTrigger id={`${formId}-role`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(adminUserRoleLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  {isSelf && (
                    <FieldDescription>不能變更自己的角色</FieldDescription>
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose
              disabled={isPending}
              render={<Button variant="outline" />}
            >
              取消
            </DialogClose>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
