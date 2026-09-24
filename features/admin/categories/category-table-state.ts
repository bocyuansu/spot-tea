import { createAtom } from '@tanstack/react-store';
import type { PaginationState, SortingState } from '@tanstack/react-table';

// 分類列表的分頁、排序與搜尋狀態放在模組層級，理由同 features/admin/products/product-table-state.ts：
// 切到其他後台頁面再回來仍停在原本的搜尋結果、排序與那一頁；刪除對話框也要靠它把頁碼歸零
export const categoryTablePaginationAtom = createAtom<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});

// 沒有排序時沿用 listAdminCategoriesWithCounts 的順序：依分類名稱
export const categoryTableSortingAtom = createAtom<SortingState>([]);

export const categoryTableGlobalFilterAtom = createAtom('');
