import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 沒帶 cookie 的訪客已經被 proxy.ts 擋在 /login，後台只會遇到「cookie 還在但
// session 失效」或「登入了但不是管理員」兩種情況。這裡同樣不能用 redirect()：
// 頁面回傳的 307 會被 Cloudflare 的快取 entrypoint 追下去（見 proxy.ts 的說明）。
export default function AccessDenied() {
  return (
    <Card className="w-full max-w-sm mx-auto my-8 [--card-spacing:--spacing(8)]">
      <CardHeader>
        <CardTitle className="text-2xl">無法進入後台</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground">
          這個頁面僅限管理員使用，請改用管理員帳號登入，或回到前台繼續選購。
        </p>
        <div className="flex gap-2">
          <Link href="/login" className={buttonVariants({ size: 'lg' })}>
            重新登入
          </Link>
          <Link
            href="/"
            className={buttonVariants({ size: 'lg', variant: 'outline' })}
          >
            回到首頁
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
