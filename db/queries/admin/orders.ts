import { getDatabase } from '@/db/client';

// 連線的選擇與理由見 db/queries/admin/overview.ts

export async function listAdminOrders() {
  const db = await getDatabase('fresh');

  return db.query.order.findMany({
    with: {
      user: { columns: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// 後台的訂單明細頁；訂單列表不需要 items 與歷程，只有這裡才一併撈出來
export async function getAdminOrderById(id: string) {
  const db = await getDatabase('fresh');

  return db.query.order.findFirst({
    where: { id },
    with: {
      user: { columns: { id: true, name: true, email: true } },
      updatedBy: { columns: { name: true } },
      items: true,
      events: {
        with: { actor: { columns: { name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

export type AdminOrder = Awaited<ReturnType<typeof listAdminOrders>>[number];
export type AdminOrderDetail = NonNullable<Awaited<ReturnType<typeof getAdminOrderById>>>;
