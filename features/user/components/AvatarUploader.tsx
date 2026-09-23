'use client';

/* UI */
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import UserAvatar from '@/components/common/UserAvatar';
import { Camera, Loader2 } from 'lucide-react';
/* Upload */
import {
  avatarContentTypes,
  avatarUploadSchema,
} from '@/features/user/schemas/avatar';
import {
  createAvatarUploadUrl,
  deleteReplacedAvatar,
} from '@/features/user/actions/avatar';
/* Better Auth */
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/auth-errors';
/* Nextjs */
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type AvatarUploaderProps = {
  image?: string | null;
};

function showError(description: string) {
  toast.add({ type: 'error', description, priority: 'high' });
}

export default function AvatarUploader({ image }: AvatarUploaderProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  // 挑好但還沒儲存的檔案，有值時才顯示儲存 / 取消
  const [file, setFile] = useState<File | null>(null);
  // 最近一次挑的圖片在瀏覽器裡的預覽網址
  const [preview, setPreview] = useState<string | null>(null);

  // 換了一張或離開頁面時，把上一張的 blob 網址還回去
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  /**
   * 選好的檔案只在瀏覽器裡預覽，按下儲存才上傳，
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
      showError(parsed.error.issues[0].message);
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function onCancel() {
    setFile(null);
    setPreview(null);
  }

  function onSave() {
    if (!file) return;

    startTransition(async () => {
      const ticket = await createAvatarUploadUrl({
        contentType: file.type,
        size: file.size,
      });

      if (!ticket.ok) {
        showError(ticket.message);
        return;
      }

      // Content-Type 有被簽進網址，這裡必須送一模一樣的值
      const response = await fetch(ticket.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      }).catch(() => null);

      if (!response?.ok) {
        showError('大頭貼上傳失敗，請稍後再試 !');
        return;
      }

      // 走 /api/auth，cookie 由回應帶回去（原因見 deleteReplacedAvatar）
      const { error } = await authClient.updateUser({ image: ticket.url });

      if (error) {
        showError(getErrorMessage(error.code ?? '', 'zh'));
        return;
      }

      // 被換掉的那張已經沒人用了；清不掉只是 bucket 多一個檔案，不能讓這次更新變成失敗
      if (image) await deleteReplacedAvatar(image).catch(() => {});

      // 預覽留著不換回去：跟剛上傳的是同一張圖，
      // 換成公開網址反而要重新下載，中間會閃一下預設圖示
      setFile(null);

      toast.add({
        type: 'success',
        description: '大頭貼已更新 !',
      });

      // Navbar 的頭像由 server component 提供，重新取一次才會同步
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
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
          disabled={isPending}
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

      {file && (
        <div className="flex gap-2">
          <Button type="button" size="sm" disabled={isPending} onClick={onSave}>
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>上傳中</span>
              </>
            ) : (
              <span>儲存</span>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={onCancel}
          >
            取消
          </Button>
        </div>
      )}
    </div>
  );
}
