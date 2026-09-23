'use client';

/* UI */
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import UserAvatar from '@/components/common/UserAvatar';
import { Camera } from 'lucide-react';
import AvatarCropDialog from '@/features/user/components/AvatarCropDialog';
/* Upload */
import {
  avatarContentTypes,
  avatarUploadSchema,
} from '@/features/user/schemas/avatar';
/* Nextjs */
import { useEffect, useRef, useState } from 'react';

type AvatarUploaderProps = {
  image?: string | null;
};

export default function AvatarUploader({ image }: AvatarUploaderProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  // 挑好但還沒裁的原圖；關掉 Dialog 時留著，讓收合動畫還看得到圖
  const [source, setSource] = useState<string | null>(null);
  // 剛儲存成功的裁切結果，直接拿來當頭像
  const [preview, setPreview] = useState<string | null>(null);

  // 換了一張或離開頁面時，把上一張的 blob 網址還回去
  useEffect(() => {
    if (!source) return;
    return () => URL.revokeObjectURL(source);
  }, [source]);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  /**
   * 選好的檔案只在 Dialog 裡裁切預覽，按下儲存才上傳，
   * 使用者中途取消或離開，就不會在物件儲存留下沒人用的圖片。
   */
  function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    // 清空才能再選一次同一個檔案
    event.target.value = '';
    if (!selected) return;

    // 真正的把關在簽上傳網址之前，這裡先擋掉明顯不合規的，不用等到儲存才知道
    const parsed = avatarUploadSchema.safeParse({
      contentType: selected.type,
      size: selected.size,
    });

    if (!parsed.success) {
      toast.add({
        type: 'error',
        description: parsed.error.issues[0].message,
        priority: 'high',
      });
      return;
    }

    setSource(URL.createObjectURL(selected));
    setOpen(true);
  }

  /**
   * 頭像留著裁好的 blob 不換回去：跟剛上傳的是同一張圖，
   * 換成公開網址反而要重新下載，中間會閃一下預設圖示
   */
  function onSaved(cropped: Blob) {
    setPreview(URL.createObjectURL(cropped));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {/* 名字就在旁邊的 <h2>，頭像當裝飾，alt 留空 */}
        <UserAvatar
          image={preview ?? image}
          className="size-16"
          fallbackClassName="bg-primary/10 text-primary"
          iconClassName="size-8"
        />
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label="上傳大頭貼"
          className="absolute -right-1 -bottom-1 rounded-full"
          onClick={() => fileInput.current?.click()}
        >
          <Camera />
        </Button>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept={avatarContentTypes.join(',')}
        className="hidden"
        onChange={onFileSelected}
      />

      {/* 每挑一張新圖就重掛一次，縮放和位置從頭開始 */}
      <AvatarCropDialog
        key={source}
        source={source}
        image={image}
        open={open}
        onOpenChange={setOpen}
        onSaved={onSaved}
      />
    </div>
  );
}
