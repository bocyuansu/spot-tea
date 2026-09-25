import { createAdminTableState } from '@/features/admin/shared/admin-table-state';

// 沒有排序時沿用 listAdminProducts 的順序：最新建立的商品在最前面
export const productTableState = createAdminTableState();
