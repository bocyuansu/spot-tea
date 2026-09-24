import { createAtom } from '@tanstack/react-store';
import type { PaginationState } from '@tanstack/react-table';

// 商品列表的分頁狀態放在模組層級：進編輯頁時 ProductTable 會卸載，但這個 atom 還在，
// 回到列表就停在原本那一頁；重新整理頁面才會回到第一頁。
// server 端只會讀取（寫入都來自使用者操作），不會跨請求互相影響
export const productTablePaginationAtom = createAtom<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});
