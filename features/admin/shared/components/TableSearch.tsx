'use client';

import { useEffect, useState } from 'react';
import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTableContext } from '@/features/admin/shared/admin-table';

type TableSearchProps = {
  placeholder: string;
  label: string;
};

export default function TableSearch({ placeholder, label }: TableSearchProps) {
  const table = useTableContext();
  const keyword: string = table.state.globalFilter;

  // 搜尋輸入框狀態
  const [value, setValue] = useState(keyword);

  useEffect(() => {
    setValue(keyword);
  }, [keyword]);

  // 延後查詢
  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      table.setGlobalFilter(value);
      // 結果筆數變了，原本那一頁可能已經不存在，回到第一頁
      table.firstPage();
    },
    { wait: 300 },
  );

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          debouncedSearch(event.target.value);
        }}
        maxLength={50}
        placeholder={placeholder}
        aria-label={label}
        className="pl-8"
      />
    </div>
  );
}
