import { createAtom } from '@tanstack/react-store';
import type { PaginationState, SortingState } from '@tanstack/react-table';

// 會員列表的分頁、排序與搜尋狀態放在模組層級，理由同 features/admin/products/product-table-state.ts：
// 切到其他後台頁面再回來仍停在原本的搜尋結果、排序與那一頁；
// 表格外的新增對話框也要靠它把列表切回第一頁
export const userTablePaginationAtom = createAtom<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});

// 沒有排序時沿用 listAdminUsers 的順序：最新加入的會員在最前面
export const userTableSortingAtom = createAtom<SortingState>([]);

export const userTableGlobalFilterAtom = createAtom('');
