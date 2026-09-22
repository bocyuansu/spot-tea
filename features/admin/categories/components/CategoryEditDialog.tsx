'use client';

/* UI */
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
import { toast } from '@/components/ui/toast';
import { Loader2 } from 'lucide-react';
/* React Hook Form */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  categoryFormSchema,
  type CategoryFormValues,
} from '@/features/admin/categories/schemas/category';
import CategoryFormFields from '@/features/admin/categories/components/CategoryFormFields';
import { updateCategory } from '@/features/admin/categories/actions/categories';
/* Nextjs */
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

type CategoryEditDialogProps = {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CategoryEditDialog({
  categoryId,
  categoryName,
  categorySlug,
  open,
  onOpenChange,
}: CategoryEditDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const defaultValues: CategoryFormValues = {
    name: categoryName,
    slug: categorySlug,
  };

  const form = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  function handleOpenChange(isOpen: boolean) {
    // 關閉 Dialog 就把改到一半的欄位還原成目前的分類資料
    if (!isOpen) form.reset(defaultValues);
    onOpenChange(isOpen);
  }

  function onSubmit(values: CategoryFormValues) {
    startTransition(async () => {
      const result = await updateCategory(categoryId, values);

      if (!result.ok) {
        toast.add({
          type: 'error',
          description: result.message,
          priority: 'high',
        });
        return;
      }

      onOpenChange(false);
      toast.add({ type: 'success', description: '分類已更新 !' });
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
            <DialogTitle>編輯分類</DialogTitle>
            <DialogDescription>
              改了網址代稱之後，舊的分類連結就會失效
            </DialogDescription>
          </DialogHeader>

          <CategoryFormFields control={form.control} />

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
