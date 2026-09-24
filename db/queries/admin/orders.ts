import { getDatabase } from '@/db/client';

// 連線的選擇與理由見 db/queries/admin/overview.ts

// 訂單列表整批送到瀏覽器給表格搜尋、排序與分頁，只撈表格用得到的欄位，
// 收件地址、備註這類個資和明細頁才用得到的欄位就不會跟著送出去
export async function listAdminOrders() {
  const db = await getDatabase('fresh');

  return db.query.order.findMany({
    columns: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentProvider: true,
      totalAmount: true,
      createdAt: true,
    },
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
export type AdminOrderDetail = NonNullable<
  Awaited<ReturnType<typeof getAdminOrderById>>
>;
