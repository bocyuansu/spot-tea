'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getProductsHref } from '@/features/products/product-catalog';

type ProductSearchProps = {
  query: string;
  activeCategorySlug?: string;
};

export default function ProductSearch({
  query,
  activeCategorySlug,
}: ProductSearchProps) {
  const router = useRouter();

  // 搜尋輸入框狀態
  const [value, setValue] = useState(query);
  // 最後一次送出的關鍵字
  const searchedQuery = useRef(query);

  // 關鍵字被別處改掉（例如按「清除搜尋」）才同步回輸入框；
  // 自己送出的搜尋載入完時，使用者可能已經又打了幾個字，不能拿舊的關鍵字蓋掉
  useEffect(() => {
    if (query === searchedQuery.current) return;
    searchedQuery.current = query;
    setValue(query);
  }, [query]);

  // 延後查詢：每次搜尋都要請伺服器重新渲染頁面
  const search = useDebouncedCallback(
    (keyword: string) => {
      const nextQuery = keyword.trim();
      // 只多打了空白，結果不會變，不必再查一次
      if (nextQuery === searchedQuery.current) return;

      searchedQuery.current = nextQuery;
      // 在目前的分類裡搜尋並回到第一頁；用 replace，每打一次字不會多一筆上一頁紀錄。
      // 使用者還在輸入，不捲回頁首
      router.replace(
        getProductsHref({ category: activeCategorySlug, query: nextQuery }),
        { scroll: false },
      );
    },
    { wait: 300 },
  );

  return (
    <div role="search" className="relative w-full md:max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          // 注音選字時也會觸發 onChange，組字完成才搜尋，才不會拿「ㄨ」這種半成品去查
          if (!(event.nativeEvent as InputEvent).isComposing) {
            search(event.target.value);
          }
        }}
        onCompositionEnd={(event) => search(event.currentTarget.value)}
        maxLength={50}
        placeholder="搜尋茶名、產地或分類"
        aria-label="搜尋商品"
        className="pl-8"
      />
    </div>
  );
}
