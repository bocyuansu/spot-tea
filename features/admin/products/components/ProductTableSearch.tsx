'use client';

import { useEffect, useState } from 'react';
import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type ProductTableSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function ProductTableSearch({
  value: initialValue,
  onChange,
}: ProductTableSearchProps) {
  // 搜尋輸入框狀態
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // 延後查詢
  const debouncedOnChange = useDebouncedCallback(onChange, { wait: 300 });

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          debouncedOnChange(event.target.value);
        }}
        maxLength={50}
        placeholder="搜尋商品名稱或分類"
        aria-label="搜尋商品"
        className="pl-8"
      />
    </div>
  );
}
