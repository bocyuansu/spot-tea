import { createAdminTableState } from '@/features/admin/shared/admin-table-state';

// 沒有排序時沿用 listAdminUsers 的順序：最新加入的會員在最前面
export const userTableState = createAdminTableState();
