'use client';

/* UI */
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  emptyProductVariant,
  productFormSchema,
  UNCATEGORIZED,
  type ProductFormValues,
} from '@/features/admin/products/schemas/product';
import ProductImagesField from '@/features/admin/products/components/ProductImagesField';
import ProductVariantMatrix from '@/features/admin/products/components/ProductVariantMatrix';
/* Server actions */
import { createProduct, updateProduct } from '@/features/admin/products/actions/products';
import { productStatusLabels } from '@/features/products/product-status';
/* Nextjs */
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminCategory, AdminProductDetail } from '@/db/queries/admin/products';

function toFormValues(product: AdminProductDetail | undefined): ProductFormValues {
  if (!product) {
    return {
      name: '',
      slug: '',
      categoryId: UNCATEGORIZED,
      status: 'draft',
      origin: '',
      description: '',
      images: [],
      variants: [emptyProductVariant],
    };
  }

  return {
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId ?? UNCATEGORIZED,
    status: product.status,
    origin: product.origin ?? '',
    description: product.description ?? '',
    images: (product.images ?? []).map((url) => ({ url })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      weightGrams: variant.weightGrams,
      label: variant.label ?? '',
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
    })),
  };
}

type ProductFormProps = {
  categories: AdminCategory[];
  // 有帶商品就是編輯，沒帶就是新增
  product?: AdminProductDetail;
};

export default function ProductForm({ categories, product }: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: toFormValues(product),
  });

  // Select 的 items 讓 SelectValue 顯示標籤而不是原始的值
  const categoryItems: Record<string, string> = {
    [UNCATEGORIZED]: '未分類',
    ...Object.fromEntries(categories.map((category) => [category.id, category.name])),
  };

  function onSubmit(values: ProductFormValues) {
    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, values)
        : await createProduct(values);

      if (!result.ok) {
        toast.add({ type: 'error', description: result.message, priority: 'high' });
        return;
      }

      toast.add({ type: 'success', description: product ? '商品已更新 !' : '商品已新增 !' });

      router.push('/admin/products');
      // 列表由 server component 提供，push 之後要再取一次才看得到剛剛的異動
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card className="[--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle className="text-xl">基本資料</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-y-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>商品名稱</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    placeholder="阿里山高山烏龍"
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>網址代稱</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    placeholder="alishan-oolong"
                    {...field}
                  />
                  <FieldDescription>前台網址會是 /products/{field.value || '...'}</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="categoryId"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>分類</FieldLabel>
                    <Select
                      items={categoryItems}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value ?? UNCATEGORIZED)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryItems).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      items={productStatusLabels}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value ?? 'draft')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(productStatusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>

            <Controller
              name="origin"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>產地</FieldLabel>
                  <Input aria-invalid={fieldState.invalid} placeholder="南投鹿谷" {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>商品描述</FieldLabel>
                  <Textarea aria-invalid={fieldState.invalid} rows={4} {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="[--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle className="text-xl">商品圖片</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductImagesField form={form} />
        </CardContent>
      </Card>

      <Card className="[--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle className="text-xl">規格與庫存</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductVariantMatrix form={form} />
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
            <span>{product ? '儲存變更' : '新增商品'}</span>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
          取消
        </Button>
      </div>
    </form>
  );
}
