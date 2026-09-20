'use client';

import { useEffect } from 'react';
import ErrorCard from '@/components/common/ErrorCard';

/**
 * 全站的錯誤邊界。頁面渲染時都會經 Hyperdrive 開 Postgres 連線，
 * 連線或查詢失敗時若沒有這一層，使用者看到的是 Next 預設的裸錯誤頁。
 *
 * 這一層攔不到 app/layout.tsx 自己拋出的錯誤（那需要 global-error.tsx），
 * 但 layout 只組外殼、不讀資料，實務上不會是出錯的來源。
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // wrangler.jsonc 開了 observability，錯誤會進 Cloudflare 的 log
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorCard
      title="頁面載入失敗"
      description="剛才那一步沒有順利完成，請稍後再試一次。若持續發生，請與我們聯繫。"
      onRetry={reset}
    />
  );
}
