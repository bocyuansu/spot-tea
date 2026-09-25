import { createAdminTableState } from '@/features/admin/shared/admin-table-state';

// 沒有排序時沿用 listAdminOrders 的順序：最新的訂單在最前面
export const orderTableState = createAdminTableState();
