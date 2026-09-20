'use client';

import { useEffect } from 'react';
import ErrorCard from '@/components/common/ErrorCard';

// 放在 (admin)/layout.tsx 旁邊，所以錯誤畫面會出現在後台的側邊欄框架裡面
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorCard
      title="後台資料載入失敗"
      description="這一頁的資料沒有取回來，可能是資料庫連線暫時中斷，請重新載入試試。"
      onRetry={reset}
      homeHref="/admin/dashboard"
      homeLabel="回儀表板"
    />
  );
}
