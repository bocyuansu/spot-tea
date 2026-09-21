import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * 後台四個頁面共用的載入骨架。放在 (admin) 這一層就涵蓋底下所有路由，
 * 不必每個 route 各放一份。儀表板一次要跑六個查詢，沒有這層會整頁空白等到好。
 */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-48" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 6 }, (_, row) => (
            <Skeleton key={row} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
