import { Leaf, Receipt, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatPriceTWD } from '@/lib/format';
import type { AdminOverview } from '@/db/queries/admin';

type AdminStatCardsProps = {
  overview: AdminOverview;
};

export default function AdminStatCards({ overview }: AdminStatCardsProps) {
  const stats = [
    {
      label: '已付款營收',
      value: formatPriceTWD(overview.paidRevenue),
      icon: TrendingUp,
    },
    {
      label: '訂單總數',
      value: `${overview.orderCount} 筆`,
      icon: Receipt,
    },
    {
      label: '會員人數',
      value: `${overview.userCount} 人`,
      icon: Users,
    },
    {
      label: '上架商品',
      value: `${overview.publishedProductCount} 項`,
      icon: Leaf,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <stat.icon className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <span className="truncate font-heading text-xl">{stat.value}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
