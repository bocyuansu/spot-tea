import { createAtom } from '@tanstack/react-store';
import type { PaginationState, SortingState } from '@tanstack/react-table';

// 訂單列表的分頁、排序與搜尋狀態放在模組層級，理由同 features/admin/products/product-table-state.ts：
// 進訂單明細頁時 OrderTable 會卸載，回到列表就停在原本的搜尋結果、排序與那一頁
export const orderTablePaginationAtom = createAtom<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});

// 沒有排序時沿用 listAdminOrders 的順序：最新的訂單在最前面
export const orderTableSortingAtom = createAtom<SortingState>([]);

export const orderTableGlobalFilterAtom = createAtom('');
