import { createAdminTableState } from '@/features/admin/shared/admin-table-state';

// 沒有排序時沿用 listAdminCategoriesWithCounts 的順序：依分類名稱
export const categoryTableState = createAdminTableState();
