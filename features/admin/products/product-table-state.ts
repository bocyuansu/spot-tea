import { createAtom } from '@tanstack/react-store';
import type { PaginationState, SortingState } from '@tanstack/react-table';

// 商品列表的分頁、排序與搜尋狀態放在模組層級：進編輯頁時 ProductTable 會卸載，但這些 atom 還在，
// 回到列表就停在原本的搜尋結果、排序與那一頁；重新整理頁面才會回到預設。
// 三者要一起保留，否則頁碼會對到另一種排序或篩選下的第幾頁。
// server 端只會讀取（寫入都來自使用者操作），不會跨請求互相影響
export const productTablePaginationAtom = createAtom<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});

// 沒有排序時沿用 listAdminProducts 的順序：最新建立的商品在最前面
export const productTableSortingAtom = createAtom<SortingState>([]);

export const productTableGlobalFilterAtom = createAtom('');
