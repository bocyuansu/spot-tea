'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FieldDescription } from '@/components/ui/field';
import { toast } from '@/components/ui/toast';
import { createProductImageUploadUrl } from '@/features/admin/products/actions/product-images';
import { productImageContentTypes } from '@/features/admin/products/schemas/product-image';
import type { ProductFormValues } from '@/features/admin/products/schemas/product';

type ProductImagesFieldProps = {
  form: UseFormReturn<ProductFormValues>;
};

export default function ProductImagesField({ form }: ProductImagesFieldProps) {
  const images = useFieldArray({ control: form.control, name: 'images' });
  const fileInput = useRef<HTMLInputElement>(null);
  // 上傳中的張數，用來補上灰色的佔位格
  const [uploadingCount, setUploadingCount] = useState(0);

  function failed(message: string) {
    toast.add({ type: 'error', description: message, priority: 'high' });
  }

  /**
   * 先跟 server action 要一張 presigned URL，再把檔案直接 PUT 到 Neon Object Storage，
   * 表單只留下上傳後的公開網址，送出時跟著其他欄位一起寫進資料庫。
   */
  async function upload(file: File) {
    const ticket = await createProductImageUploadUrl({
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    });

    if (!ticket.ok) {
      failed(`${file.name}：${ticket.message}`);
      return;
    }

    // Content-Type 有被簽進網址，這裡必須送一模一樣的值
    const response = await fetch(ticket.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });

    if (!response.ok) {
      failed(`${file.name} 上傳失敗，請稍後再試 !`);
      return;
    }

    images.append({ url: ticket.url });
  }

  async function onFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    // 清空才能再選一次同一個檔案，也要在 await 之前先拿好 files
    event.target.value = '';
    if (files.length === 0) return;

    setUploadingCount(files.length);

    // 一張一張傳，順序才會跟使用者挑選的一致
    for (const file of files) {
      await upload(file);
      setUploadingCount((count) => count - 1);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {images.fields.length === 0 && uploadingCount === 0 ? (
        <p className="text-sm text-muted-foreground">還沒有圖片，前台會顯示預設的茶葉圖示</p>
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
                  className="object-cover"
                />
                <Badge
                  variant={index === 0 ? 'default' : 'secondary'}
                  className="absolute top-1.5 left-1.5"
                >
                  {index === 0 ? '封面' : `第 ${index + 1} 張`}
                </Badge>
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
                  onClick={() => images.remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}

          {Array.from({ length: uploadingCount }, (_, index) => (
            <li key={`uploading-${index}`} className="flex flex-col gap-2">
              <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-foreground/10">
                <Loader2 className="size-6 animate-spin" />
              </div>
            </li>
          ))}
        </ul>
      )}

      <FieldDescription>
        第一張會用在商品列表的封面，用箭頭調整順序。單張上限 5MB，支援 JPG、PNG、WebP、AVIF
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
        disabled={uploadingCount > 0}
        onClick={() => fileInput.current?.click()}
      >
        {uploadingCount > 0 ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>上傳中</span>
          </>
        ) : (
          <>
            <ImagePlus className="size-4" />
            <span>從電腦選擇圖片</span>
          </>
        )}
      </Button>
    </div>
  );
}
