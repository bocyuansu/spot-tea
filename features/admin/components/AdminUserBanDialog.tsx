'use client';

/* UI */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { Loader2 } from 'lucide-react';
/* React Hook Form */
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  adminBanDurationLabels,
  adminBanDurationSeconds,
  adminBanUserSchema,
  type AdminBanUserValues,
} from '@/features/admin/schemas/user';
/* Better Auth */
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/auth-errors';
/* Nextjs */
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

type AdminUserBanDialogProps = {
  userId: string;
  userName: string;
  // 停權與解除停權共用這個對話框，只有停權需要填原因與期限
  banned: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AdminUserBanDialog({
  userId,
  userName,
  banned,
  open,
  onOpenChange,
}: AdminUserBanDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(adminBanUserSchema),
    defaultValues: {
      duration: 'permanent' as const,
      banReason: '',
    },
  });

  // 這個對話框跟著表格列一直掛著，關掉時要清乾淨，不然下次打開還留著上次沒送出的原因
  function handleOpenChange(next: boolean) {
    if (!next) form.reset();
    onOpenChange(next);
  }

  function onSubmit(values: AdminBanUserValues) {
    startTransition(async () => {
      const banReason = values.banReason.trim();

      // 兩個欄位都是選填，送 undefined 就不會進 request body，由 admin plugin 決定預設值
      const { error } = banned
        ? await authClient.admin.unbanUser({ userId })
        : await authClient.admin.banUser({
            userId,
            banReason: banReason || undefined,
            banExpiresIn: adminBanDurationSeconds[values.duration],
          });

      if (error) {
        toast.add({
          type: 'error',
          description: getErrorMessage(error.code ?? '', 'zh'),
          priority: 'high',
        });
        return;
      }

      handleOpenChange(false);
      toast.add({ type: 'success', description: banned ? '會員已解除停權 !' : '會員已停權 !' });
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {banned ? `確定要解除「${userName}」的停權嗎 ?` : `確定要停權「${userName}」嗎 ?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banned
                ? '解除之後這位會員就能重新登入，購物車與訂單紀錄都不受影響。'
                : '停權會立刻把這位會員登入中的裝置登出，停權期間也無法再登入。'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!banned && (
            <FieldGroup className="gap-y-4">
              <Controller
                name="duration"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>停權期限</FieldLabel>
                    <Select
                      items={adminBanDurationLabels}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value ?? 'permanent')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(adminBanDurationLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>期限到了會員就能自己重新登入</FieldDescription>
                  </Field>
                )}
              />

              <Controller
                name="banReason"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>停權原因（選填）</FieldLabel>
                    <Textarea
                      aria-invalid={fieldState.invalid}
                      placeholder="例如：惡意下單"
                      rows={3}
                      {...field}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>取消</AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              variant={banned ? 'default' : 'destructive'}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>處理中</span>
                </>
              ) : (
                <span>{banned ? '解除停權' : '停權'}</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
