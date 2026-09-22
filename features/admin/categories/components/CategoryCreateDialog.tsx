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
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { Loader2, Plus } from 'lucide-react';
/* React Hook Form */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  categoryFormSchema,
  emptyCategory,
  type CategoryFormValues,
} from '@/features/admin/categories/schemas/category';
import CategoryFormFields from '@/features/admin/categories/components/CategoryFormFields';
import { createCategory } from '@/features/admin/categories/actions/categories';
/* Nextjs */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoryCreateDialog() {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: emptyCategory,
  });

  function handleOpenChange(isOpen: boolean) {
    // 關閉 Dialog 就清除表單
    if (!isOpen) form.reset(emptyCategory);
    setOpen(isOpen);
  }

  function onSubmit(values: CategoryFormValues) {
    startTransition(async () => {
      const result = await createCategory(values);

      if (!result.ok) {
        toast.add({
          type: 'error',
          description: result.message,
          priority: 'high',
        });
        return;
      }

      setOpen(false);
      form.reset(emptyCategory);
      toast.add({ type: 'success', description: '分類已建立 !' });
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        <span>新增分類</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>新增分類</DialogTitle>
            <DialogDescription>
              建立之後就能在商品表單的分類選單裡選到
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
                  <span>建立中</span>
                </>
              ) : (
                <span>建立分類</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
