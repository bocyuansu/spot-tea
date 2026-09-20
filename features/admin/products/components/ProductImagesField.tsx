'use client';

import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { ChevronDown, ChevronUp, ImagePlus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  emptyProductImage,
  type ProductFormValues,
} from '@/features/admin/products/schemas/product';

type ProductImagesFieldProps = {
  form: UseFormReturn<ProductFormValues>;
};

// 一列一張圖，之後接上傳功能時把 Input 換成上傳元件、寫回同一個 url 欄位就好
export default function ProductImagesField({ form }: ProductImagesFieldProps) {
  const images = useFieldArray({ control: form.control, name: 'images' });

  return (
    <div className="flex flex-col gap-3">
      {images.fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">還沒有圖片，前台會顯示預設的茶葉圖示</p>
      ) : (
        images.fields.map((imageField, index) => {
          const imageErrors = form.formState.errors.images?.[index];

          return (
            <div key={imageField.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge variant={index === 0 ? 'default' : 'outline'} className="w-14 shrink-0">
                  {index === 0 ? '封面' : `第 ${index + 1} 張`}
                </Badge>

                <Input
                  placeholder="/products/spot-tea.jpg"
                  aria-label={`第 ${index + 1} 張圖片的路徑`}
                  aria-invalid={Boolean(imageErrors?.url)}
                  {...form.register(`images.${index}.url`)}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`把第 ${index + 1} 張往前移`}
                  disabled={index === 0}
                  onClick={() => images.move(index, index - 1)}
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`把第 ${index + 1} 張往後移`}
                  disabled={index === images.fields.length - 1}
                  onClick={() => images.move(index, index + 1)}
                >
                  <ChevronDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`移除第 ${index + 1} 張圖片`}
                  onClick={() => images.remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              {imageErrors?.url && <FieldError className="pl-16" errors={[imageErrors.url]} />}
            </div>
          );
        })
      )}

      <FieldDescription>第一張會用在商品列表的封面，用箭頭調整順序</FieldDescription>

      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={() => images.append(emptyProductImage)}
      >
        <ImagePlus className="size-4" />
        <span>新增圖片</span>
      </Button>
    </div>
  );
}
