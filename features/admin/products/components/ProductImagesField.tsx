'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { ChevronLeft, ChevronRight, ImagePlus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FieldDescription } from '@/components/ui/field';
import { toast } from '@/components/ui/toast';
import {
  productImageContentTypes,
  productImageUploadSchema,
} from '@/features/admin/products/schemas/product-image';
import type { ProductFormValues } from '@/features/admin/products/schemas/product';

type ProductImagesFieldProps = {
  form: UseFormReturn<ProductFormValues>;
};

export default function ProductImagesField({ form }: ProductImagesFieldProps) {
  const images = useFieldArray({ control: form.control, name: 'images' });
  const fileInput = useRef<HTMLInputElement>(null);

  // 預覽的 blob 網址在離開表單前要還回去，不然會一直佔著記憶體
  useEffect(() => {
    return () => {
      for (const image of form.getValues('images')) {
        if (image.file) URL.revokeObjectURL(image.url);
      }
    };
  }, [form]);

  /**
   * 選好的檔案只在瀏覽器裡預覽，File 跟著表單一起留到送出時才上傳，
   * 使用者中途離開或按取消，就不會在物件儲存留下沒人用的圖片。
   */
  function onFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    // 清空才能再選一次同一個檔案
    event.target.value = '';

    for (const file of files) {
      // 真正的把關在簽上傳網址之前，這裡先擋掉明顯不合規的，不用等到送出才知道
      const parsed = productImageUploadSchema.safeParse({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      });

      if (!parsed.success) {
        toast.add({
          type: 'error',
          description: `${file.name}：${parsed.error.issues[0].message}`,
          priority: 'high',
        });
        continue;
      }

      images.append({ url: URL.createObjectURL(file), file });
    }
  }

  function removeImage(index: number) {
    const image = form.getValues(`images.${index}`);
    if (image.file) URL.revokeObjectURL(image.url);

    images.remove(index);
  }

  return (
    <div className="flex flex-col gap-3">
      {images.fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          還沒有圖片，前台會顯示預設的茶葉圖示
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.fields.map((imageField, index) => (
            <li key={imageField.id} className="flex flex-col gap-2">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
                <Image
                  src={imageField.url}
                  alt={`商品圖片 ${index + 1}`}
                  fill
                  sizes="200px"
                  // 還沒上傳的是本機 blob 網址，送進 /_next/image 會被當成非法來源擋掉
                  unoptimized={Boolean(imageField.file)}
                  className="object-cover"
                />
                <Badge
                  variant={index === 0 ? 'default' : 'secondary'}
                  className="absolute top-1.5 left-1.5"
                >
                  {index === 0 ? '封面' : `第 ${index + 1} 張`}
                </Badge>
                {imageField.file && (
                  <Badge
                    variant="outline"
                    className="absolute top-1.5 right-1.5 bg-background"
                  >
                    待上傳
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`把第 ${index + 1} 張往前移`}
                  disabled={index === 0}
                  onClick={() => images.move(index, index - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`把第 ${index + 1} 張往後移`}
                  disabled={index === images.fields.length - 1}
                  onClick={() => images.move(index, index + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`移除第 ${index + 1} 張圖片`}
                  onClick={() => removeImage(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FieldDescription>
        第一張會用在商品列表的封面，用箭頭調整順序。圖片會在儲存時才上傳，單張上限
        5MB，支援 JPG、PNG、WebP、AVIF
      </FieldDescription>

      <input
        ref={fileInput}
        type="file"
        accept={productImageContentTypes.join(',')}
        multiple
        className="hidden"
        onChange={onFilesSelected}
      />

      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={() => fileInput.current?.click()}
      >
        <ImagePlus className="size-4" />
        <span>從電腦選擇圖片</span>
      </Button>
    </div>
  );
}
