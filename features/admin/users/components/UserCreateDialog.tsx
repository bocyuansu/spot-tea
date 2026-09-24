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
  DialogTrigger,
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
import { Loader2, Plus } from 'lucide-react';
/* React Hook Form */
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  adminCreateUserSchema,
  adminUserRoleLabels,
  type AdminCreateUserValues,
} from '@/features/admin/users/schemas/user';
import {
  userTableGlobalFilterAtom,
  userTablePaginationAtom,
  userTableSortingAtom,
} from '@/features/admin/users/user-table-state';
/* Better Auth */
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/auth-errors';
/* Nextjs */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const emptyUser: AdminCreateUserValues = {
  name: '',
  email: '',
  password: '',
  role: 'customer',
};

export default function UserCreateDialog() {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: emptyUser,
  });

  function handleOpenChange(isOpen: boolean) {
    // 關閉 Dialog 就清除表單
    if (!isOpen) form.reset(emptyUser);
    setOpen(isOpen);
  }

  function onSubmit(data: AdminCreateUserValues) {
    const { name, email, password, role } = data;
    startTransition(async () => {
      // 後台建立會員走 admin plugin 的端點，它會自己確認呼叫者是不是管理員
      await authClient.admin.createUser({
        name,
        email,
        password,
        role,
        // 註冊要驗證信箱才能登入；後台建的帳號由管理員擔保，直接標成已驗證
        data: { emailVerified: true },
        fetchOptions: {
          onSuccess: () => {
            setOpen(false);
            form.reset();
            toast.add({ type: 'success', description: '會員已建立 !' });
            // 新會員在預設順序下排在列表最前面：清掉搜尋與排序、回到第一頁才看得到
            userTableGlobalFilterAtom.set('');
            userTableSortingAtom.set([]);
            userTablePaginationAtom.set((old) => ({ ...old, pageIndex: 0 }));
            router.refresh();
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        <span>新增會員</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>新增會員</DialogTitle>
            <DialogDescription>
              直接建立一個已經可以登入的帳號
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-y-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>用戶名稱</FieldLabel>
                  <Input
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>密碼</FieldLabel>
                  <Input
                    type="password"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                    onValueChange={(value) =>
                      field.onChange(value ?? 'customer')
                    }
                  >
                    <SelectTrigger className="w-full">
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
                  <span>建立中</span>
                </>
              ) : (
                <span>建立會員</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
