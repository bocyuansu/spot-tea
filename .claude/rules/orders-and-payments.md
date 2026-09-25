---
paths:
  - 'features/orders/**'
  - 'features/checkout/**'
  - 'features/payments/**'
  - 'features/admin/orders/**'
  - 'features/cart/**'
  - 'app/api/payments/**'
  - 'db/schema/order.ts'
  - 'db/queries/orders.ts'
---

# 訂單、庫存與金流

## 狀態轉移

- 訂單狀態與付款狀態只能照 `features/orders/order-status.ts` 定義的轉移往前推。後台只提供「下一步」按鈕，**不做**可以任意改狀態的編輯表單。
- 狀態轉移的 `UPDATE` 把允許的前一個狀態寫進 `WHERE`。命中 0 列代表畫面已過期或有人同時操作，回傳「請重新整理」的訊息。
- 寫入 `order` 表時設定 `updatedById`：管理員操作填管理員的 id，顧客結帳或綠界回呼填 `null`。
- 每次狀態變更都在**同一個 transaction** 裡寫一筆 `order_event`。

正確寫法（節錄自 `features/admin/orders/actions/orders.ts`）：

```ts
const from = getPreviousStatuses(orderStatusTransitions, parsed.data);

const updated = await db.transaction(async (tx) => {
  const [row] = await tx
    .update(order)
    .set({ status: parsed.data, updatedById: admin.id })
    .where(and(eq(order.id, id), inArray(order.status, from)))
    .returning({ id: order.id });

  if (!row) return false; // 過期或併發，交給呼叫端回報

  await tx
    .insert(orderEvent)
    .values({ orderId: row.id, status: parsed.data, actorId: admin.id });

  return true;
});
```

錯誤寫法：

```ts
// 先讀再判斷：兩個請求可能同時通過檢查；也沒有 updatedById 與 order_event
const current = await db.query.order.findFirst({ where: { id } });
if (current.status === 'pending') {
  await db.update(order).set({ status: next }).where(eq(order.id, id));
}
```

## 結帳與庫存

- 品名、單價、庫存一律在 server 重新查詢，不信任 client 傳來的值。
- 扣庫存在資料庫端相減並帶條件：`` .set({ stock: sql`${productVariant.stock} - ${n}` }) `` 搭配 `gte(productVariant.stock, n)`，命中 0 列就是庫存不足。寫成 `set({ stock: row.stock - n })` 會發生 lost update，兩個人搶最後一件時會超賣。
- 取消訂單（只能在出貨前）在同一個 transaction 裡用 `restoreOrderStock` 補回庫存。

## 綠界金流

- `notify` 與 `result` 兩個回呼共用 `features/payments/ecpay-result.ts`：先驗證 CheckMacValue 與特店編號，再以 `WHERE payment_status = 'unpaid'` 確保只入帳一次。
- `SimulatePaid=1` 的模擬付款不標記為已付款。
- 綠界 API 細節看 `.claude/skills/ecpay`。

## 時區

Worker 跑在 UTC，但日期和訂單編號（`ST-YYYYMMDD-NNNN`）一律以 `Asia/Taipei` 計算（見 `features/orders/order-number.ts`）。
