'use client';

import { Controller, type Control } from 'react-hook-form';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { CategoryFormValues } from '@/features/admin/categories/schemas/category';

// 新增與編輯的欄位完全一樣，只有送出的 action 不同
export default function CategoryFormFields({
  control,
}: {
  control: Control<CategoryFormValues>;
}) {
  return (
    <FieldGroup className="gap-y-4">
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>分類名稱</FieldLabel>
            <Input
              aria-invalid={fieldState.invalid}
              placeholder="烏龍茶"
              {...field}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="slug"
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>網址代稱</FieldLabel>
            <Input
              aria-invalid={fieldState.invalid}
              placeholder="oolong"
              {...field}
            />
            <FieldDescription>
              前台用它篩選商品：/products?category=網址代稱
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
