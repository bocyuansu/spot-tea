---
paths:
  - 'db/queries/**'
  - 'features/**/actions/**'
  - 'features/products/**'
  - 'wrangler.jsonc'
---

# 前台快取

- 前台讀取（`db/queries/products.ts`）包 `unstable_cache`，結果存在 `VINEXT_KV_CACHE`，失效標籤是 `products`、`categories`。
- 會改變商品或分類資料的 server action，寫入成功後呼叫 `updateTag('products')` 或 `updateTag('categories')`。取消訂單會補回庫存，也要清 `products`。
- 整份型錄只快取**一個 key**，篩選、搜尋、分頁都在記憶體裡做（`features/products/product-catalog.ts`）。
  原因：KV 每天只有 1,000 次寫入額度，依查詢參數各開一個 cache key 會很快用完。新增篩選條件時，擴充 `product-catalog.ts` 的記憶體邏輯。
- `db/queries/admin/` 不包快取，後台必須看到即時資料。
- `wrangler.jsonc` 頂層的 `cache` 維持 `enabled: false`，打開會和 vinext 的 KV cache 衝突。
