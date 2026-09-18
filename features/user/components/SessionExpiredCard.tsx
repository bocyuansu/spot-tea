import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 沒帶 cookie 的訪客已經被 proxy.ts 擋在外面，會員頁只會遇到 cookie 還在、
// session 卻已失效的情況。這裡不能用 redirect()：頁面的 307 會被 Cloudflare
// 的快取 entrypoint 自己追下去，變成無限轉址（見 proxy.ts 的說明）。
export default function SessionExpiredCard() {
  return (
    <Card className="w-full max-w-sm mx-auto my-8 [--card-spacing:--spacing(8)]">
      <CardHeader>
        <CardTitle className="text-2xl">登入狀態已失效</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground">請重新登入後再查看會員中心。</p>
        <Link href="/login" className={buttonVariants({ size: 'lg' })}>
          前往登入
        </Link>
      </CardContent>
    </Card>
  );
}
