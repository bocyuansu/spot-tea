import {
  columnFilteringFeature,
  constructFilterFn,
  constructSortFn,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  createTableHook,
  filterFn_includesString,
  globalFilteringFeature,
  metaHelper,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_datetime,
  tableFeatures,
} from '@tanstack/react-table';
import { normalizeSearchText } from '@/features/products/product-catalog';
import SortableTableHead from '@/features/admin/shared/components/SortableTableHead';
import TableContent from '@/features/admin/shared/components/TableContent';
import TablePagination from '@/features/admin/shared/components/TablePagination';
import TableSearch from '@/features/admin/shared/components/TableSearch';

// 同一個 className 會同時套在 <th> 與 <td>，讓標題和內容的寬度、對齊一致
type AdminColumnMeta = {
  className?: string;
};

// 和前台搜尋一樣不分全半形與大小寫：輸入法打出的 ＧＡＢＡ 也找得到 GABA
const filterFn_includesKeyword = constructFilterFn({
  ...filterFn_includesString,
  resolveFilterValue: (value) => normalizeSearchText(String(value).trim()),
  resolveDataValue: (value) =>
    value == null ? undefined : normalizeSearchText(String(value)),
});

// 內建的 text 排序比的是字元編碼，中文排起來沒有規則可循；
// 改用繁體中文的排序規則（依筆畫），numeric 讓「75g」排在「150g」前面
const zhHantCollator = new Intl.Collator('zh-Hant-TW', { numeric: true });
const sortFn_zhHant = constructSortFn({
  sort: (dataValueA, dataValueB) =>
    zhHantCollator.compare(dataValueA, dataValueB),
  resolveDataValue: (value) => String(value ?? ''),
});

/**
 * 後台的商品、分類、訂單、會員列表共用這一組設定，搜尋、排序、分頁的行為才會一致。
 * 各列表只帶自己的欄位、資料與狀態 atom（見 admin-table-state.ts）；
 * 搜尋框、表格內容、分頁列與可排序的表頭也在這裡註冊，
 * 用 <table.TableSearch />、<table.TableContent />、<table.TablePagination />、<header.SortableTableHead /> 取用
 */
export const {
  createAppColumnHelper,
  useAppTable,
  useTableContext,
  useHeaderContext,
} = createTableHook({
  // 同一個 hook 建出來的表格共用同一組 features，只有商品與分類列表用到的勾選、只有商品列表用到的展開也要放在這裡
  features: tableFeatures({
    columnFilteringFeature,
    globalFilteringFeature,
    rowSortingFeature,
    rowExpandingFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    filteredRowModel: createFilteredRowModel(),
    sortedRowModel: createSortedRowModel(),
    expandedRowModel: createExpandedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    filterFns: { includesKeyword: filterFn_includesKeyword },
    sortFns: { zhHant: sortFn_zhHant, datetime: sortFn_datetime },
    columnMeta: metaHelper<AdminColumnMeta>(),
  }),

  // row.id 預設是陣列索引；改用資料的 id 當 React key，刪除一筆後其他列的元件狀態才不會錯位
  getRowId: (row) => row.id,
  globalFilterFn: 'includesKeyword',
  // 一次只依一欄排序：標題上的箭頭看不出多欄排序的先後
  enableMultiSort: false,
  // 資料更新（例如編輯或批次上下架後重新整理）時停在原本那一頁；
  // 會讓列表長度改變的新增與刪除，以及搜尋和排序，由它們自己把頁碼歸零
  autoResetPageIndex: false,
  // 註冊元件
  tableComponents: { TableSearch, TableContent, TablePagination },
  headerComponents: { SortableTableHead },
});
