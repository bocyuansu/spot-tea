import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import CategoryMenu from '@/features/admin/categories/components/CategoryMenu';
import { formatDateTW } from '@/lib/format';
import type { AdminCategoryWithCount } from '@/db/queries/admin/categories';

type CategoryTableProps = {
  categories: AdminCategoryWithCount[];
};

export default function CategoryTable({ categories }: CategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <p>目前還沒有任何分類</p>
        <p className="text-sm">建立分類之後，就能在商品表單裡指定分類</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>分類</TableHead>
              <TableHead>網址代稱</TableHead>
              <TableHead className="text-right">商品數</TableHead>
              <TableHead className="text-right">建立日期</TableHead>
              <TableHead className="w-24 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {category.slug}
                </TableCell>
                <TableCell className="text-right">
                  {category.productCount}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDateTW(category.createdAt)}
                </TableCell>
                <TableCell>
                  <CategoryMenu category={category} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
