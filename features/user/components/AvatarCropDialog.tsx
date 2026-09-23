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
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react';
/* Crop */
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { cropAvatar } from '@/features/user/crop-avatar';
/* Upload */
import {
  createAvatarUploadUrl,
  deleteReplacedAvatar,
} from '@/features/user/actions/avatar';
/* Better Auth */
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/auth-errors';
/* Nextjs */
import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const minZoom = 1;
const maxZoom = 3;

type AvatarCropDialogProps = {
  /** 使用者剛挑的原圖（blob 網址），裁切的來源 */
  source: string | null;
  /** 目前的大頭貼，換成新的之後要把它從 bucket 清掉 */
  image?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 上傳成功後把裁好的圖交回去，當作畫面上的頭像 */
  onSaved: (cropped: Blob) => void;
};

function showError(description: string) {
  toast.add({ type: 'error', description, priority: 'high' });
}

export default function AvatarCropDialog({
  source,
  image,
  open,
  onOpenChange,
  onSaved,
}: AvatarCropDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(minZoom);
  const [area, setArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setArea(areaPixels);
  }, []);

  function handleOpenChange(isOpen: boolean) {
    // 上傳到一半不讓 Esc 或點背景關掉，免得使用者以為取消了其實已經換掉
    if (!isOpen && isPending) return;
    onOpenChange(isOpen);
  }

  function onSave() {
    if (!source || !area) return;

    startTransition(async () => {
      const cropped = await cropAvatar(source, area).catch(() => null);

      if (!cropped) {
        showError('圖片裁切失敗，請換一張再試 !');
        return;
      }

      const ticket = await createAvatarUploadUrl({
        contentType: cropped.type,
        size: cropped.size,
      });

      if (!ticket.ok) {
        showError(ticket.message);
        return;
      }

      // Content-Type 有被簽進網址，這裡必須送一模一樣的值
      const response = await fetch(ticket.uploadUrl, {
        method: 'PUT',
        body: cropped,
        headers: { 'Content-Type': cropped.type },
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

      onSaved(cropped);
      onOpenChange(false);
      toast.add({ type: 'success', description: '大頭貼已更新 !' });

      // Navbar 的頭像由 server component 提供，重新取一次才會同步
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>裁切大頭貼</DialogTitle>
          <DialogDescription>拖曳調整位置，用下方滑桿縮放</DialogDescription>
        </DialogHeader>

        {/* Cropper 是 absolute 撐滿父層，父層要 relative 並給高度 */}
        <div className="relative h-72 overflow-hidden rounded-lg bg-muted">
          {source && (
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              minZoom={minZoom}
              maxZoom={maxZoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <ZoomOut className="size-4 shrink-0" />
          <input
            type="range"
            aria-label="縮放"
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={zoom}
            disabled={isPending}
            className="w-full accent-primary"
            onChange={(event) => setZoom(Number(event.target.value))}
          />
          <ZoomIn className="size-4 shrink-0" />
        </div>

        <DialogFooter>
          <DialogClose
            disabled={isPending}
            render={<Button variant="outline" />}
          >
            取消
          </DialogClose>
          <Button type="button" disabled={isPending || !area} onClick={onSave}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>上傳中</span>
              </>
            ) : (
              <span>儲存</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
