import { createAtom } from '@tanstack/react-store';
import type { PaginationState, SortingState } from '@tanstack/react-table';

/**
 * 後台列表的分頁、排序與搜尋狀態，各列表在自己的 domain 資料夾建一份放在模組層級：
 * 進編輯或明細頁時表格會卸載，但這些 atom 還在，回到列表就停在原本的搜尋結果、排序與那一頁；
 * 重新整理頁面才會回到預設。三者要一起保留，否則頁碼會對到另一種排序或篩選下的第幾頁。
 * 表格外的新增、刪除對話框與表單也靠它把列表切回第一頁。
 * server 端只會讀取（寫入都來自使用者操作），不會跨請求互相影響
 */
export function createAdminTableState() {
  // 讓 TanStack Store atom 管理狀態
  const atoms = {
    pagination: createAtom<PaginationState>({ pageIndex: 0, pageSize: 10 }),
    // 沒有排序時沿用查詢本身的順序
    sorting: createAtom<SortingState>([]),
    globalFilter: createAtom(''),
  };

  // 回到第一頁；每頁筆數是管理員自己選的，保留不動
  function firstPage() {
    atoms.pagination.set((old) => ({ ...old, pageIndex: 0 }));
  }

  function reset() {
    atoms.globalFilter.set('');
    atoms.sorting.set([]);
    firstPage();
  }

  return {
    atoms,
    firstPage,
    reset,
  };
}
