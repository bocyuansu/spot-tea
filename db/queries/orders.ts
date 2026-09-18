import { getDatabase } from '@/db/client';

export async function listUserOrders(userId: string) {
  const db = await getDatabase();

  return db.query.order.findMany({
    where: { userId },
    with: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export type OrderWithItems = Awaited<ReturnType<typeof listUserOrders>>[number];
