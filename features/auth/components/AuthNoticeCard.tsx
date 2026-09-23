import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AuthNoticeCardProps = {
  title: string;
  children: React.ReactNode;
  href: string;
  linkLabel: string;
};

// 註冊後請收信、忘記密碼已寄出、信箱驗證結果、重設連結失效，都是「一段說明 + 一個去處」。
// 這幾個頁面都不能用 redirect()（見 proxy.ts 的說明），改成顯示這張卡片讓使用者自己點。
export default function AuthNoticeCard({
  title,
  children,
  href,
  linkLabel,
}: AuthNoticeCardProps) {
  return (
    <Card className="w-full max-w-sm mx-auto my-8 [--card-spacing:--spacing(8)]">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground">{children}</p>
        <Link href={href} className={buttonVariants({ size: 'lg' })}>
          {linkLabel}
        </Link>
      </CardContent>
    </Card>
  );
}
