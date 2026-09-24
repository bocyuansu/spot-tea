import Form from 'next/form';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ProductSearchProps = {
  query: string;
  activeCategorySlug?: string;
};

export default function ProductSearch({
  query,
  activeCategorySlug,
}: ProductSearchProps) {
  return (
    // key：input 是非受控的，使用者打過字之後 defaultValue 改了也不會更新畫面，
    // 關鍵字變了（例如按「清除搜尋」）就重新掛載，讓輸入框跟網址一致
    <Form
      key={query}
      action="/products"
      prefetch={false}
      role="search"
      className="flex w-full gap-2 md:max-w-sm"
    >
      {/* 在目前的分類裡搜尋；送出後回到第一頁，所以不帶 page */}
      {activeCategorySlug && (
        <input type="hidden" name="category" value={activeCategorySlug} />
      )}
      <Input
        type="search"
        name="q"
        defaultValue={query}
        maxLength={50}
        placeholder="搜尋茶名、產地或分類"
        aria-label="搜尋商品"
      />
      <Button type="submit" className="gap-1.5">
        <Search />
        搜尋
      </Button>
    </Form>
  );
}
