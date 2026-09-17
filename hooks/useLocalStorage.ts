import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 第一次渲染一律使用 initialValue，讓 client 的 HTML 與 server 一致，
  // 避免 hydration 不一致；實際的值等掛載後再從 localStorage 讀進來
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`讀取 localStorage "${key}" 失敗:`, error);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    // 水合完成前不要寫入，否則會用 initialValue 覆蓋既有資料
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`寫入 localStorage 失敗"${key}":`, error);
    }
  }, [key, value, isHydrated]);

  return [value, setValue, isHydrated] as const;
}
