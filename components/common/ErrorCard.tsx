'use client';

import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ErrorCardProps = {
  title: string;
  description: string;
  /** Next.js error boundary 傳進來的重試函式，會重新渲染出錯的那一段 */
  onRetry: () => void;
  /** 「回首頁」之外的去處，後台指回儀表板比較合理 */
  homeHref?: string;
  homeLabel?: string;
};

export default function ErrorCard({
  title,
  description,
  onRetry,
  homeHref = '/',
  homeLabel = '回首頁',
}: ErrorCardProps) {
  return (
    <Card className="w-full max-w-sm mx-auto my-8 [--card-spacing:--spacing(8)]">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground">{description}</p>
        <div className="flex gap-2">
          <Button type="button" size="lg" onClick={onRetry}>
            重新載入
          </Button>
          <Link href={homeHref} className={buttonVariants({ size: 'lg', variant: 'outline' })}>
            {homeLabel}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
