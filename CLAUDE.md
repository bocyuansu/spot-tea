# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案

找茶 spot-tea：台灣茶葉電商（前台、會員中心、管理後台、綠界金流）。框架是 **vinext**，用 Vite 重新實作的 Next.js App Router 相容層，不是 Next.js 本身；部署在 **Cloudflare Workers 免費方案**。Next.js 的慣用寫法不一定能用，碰到路由、快取、`next/image` 等行為時，先看 `node_modules/vinext/README.md` 的「API coverage」與「What's NOT supported」。

程式碼註解與 UI 文字都用繁體中文。README 是給面試官與招募者看的作品集介紹，更新時維持「挑戰 → 原因 → 解法」的寫法，不寫成維運文件。

## 指令

套件管理用 pnpm。有 script 就用 script；沒有的一次性指令用 `pnpm dlx`，不要用 `npx`。

```sh
pnpm dev                 # 本機開發，http://localhost:3000
pnpm preview             # build 後用 wrangler dev 跑產出的 Worker（localhost:8787）
pnpm deploy              # 部署（需先 pnpm build）
pnpm typecheck           # tsc --noEmit
pnpm lint                # oxlint
pnpm format              # oxfmt（單引號等風格交給它，不要手調）
pnpm test                # vitest run
pnpm test features/orders/order-status.test.ts   # 跑單一檔案
pnpm test -t "calculateShippingFee"               # 依 describe / it 名稱篩選（測試名稱是英文）
pnpm db:generate         # 依 db/schema 產生 migration 到 drizzle/
pnpm db:migrate          # 套用 migration（讀 .env.local 的 DATABASE_URL_UNPOOLED）
pnpm db:seed             # 寫入示範分類與商品
pnpm cf-typegen          # 改了 wrangler.jsonc 的 binding 後重新產生 worker-configuration.d.ts
```

Better Auth 的 schema 用 `pnpm dlx auth@latest generate --config lib/auth-cli.ts` 產生。`lib/auth-cli.ts` 是給純 Node 環境用的設定，`lib/auth.ts` 依賴 `cloudflare:workers` 所以不能給 CLI 載入；在 `lib/auth.ts` 增加會動到 schema 的 plugin 時，兩邊要同步。

`pnpm dev` 和 `pnpm preview` 都**不會**套用 Workers 每請求 10ms 的 CPU 上限，也不會套用 PBKDF2 十萬次迭代的上限，這兩者只能在部署後的 Worker 上驗證。

## 架構

### 目錄分工

- `app/`：路由保持精簡。route group 分成 `(shop)` 前台、`(user)` 會員中心、`(auth)` 登入註冊、`(admin)` 後台；`api/auth/[...all]` 是 Better Auth，`api/payments/ecpay/{notify,result}` 是綠界回呼。
- `features/<feature>/`：功能的 `actions/`（server action）、`components/`、`schemas/`（zod），加上純邏輯模組，單元測試 `*.test.ts` 放在被測模組旁邊。
- `features/admin/` 依 domain 分子資料夾（`products`、`categories`、`orders`、`users`、`dashboard`、`shared`），裡面的元件不加 `Admin` 前綴，路徑已經說明了。
- `components/ui/` **只放 shadcn/ui primitive**，要保持可以隨時用 shadcn 重新產生。專案自己寫的共用元件放 `components/common/`（PascalCase 檔名，每檔一個 `export default function`）。
- `db/`：`schema/`（Drizzle 資料表）、`relations/`、`queries/`（讀取；寫入在 `features/*/actions`）。

### 資料庫

- `db/client.ts` 的 `getDatabase(mode)` 每次呼叫都 new 一個 `pg.Client` 經 Hyperdrive 連線，不呼叫 `end()`。這是 Cloudflare 官方的 Hyperdrive 寫法，**不要修改 `db/client.ts`**。目前所有程式碼都傳 `'fresh'`（`HYPERDRIVE_FRESH`，沒有查詢快取）；`'cached'` 模式與 `HYPERDRIVE` binding 是刻意保留的。
- `db/relations/` 每個 domain 一個 `defineRelationsPart`，在 `index.ts` 以淺層 spread 合併。規則（詳見 `index.ts` 的註解）：沒有 callback 的 `mainPart` 必須排第一個，讓每張表（包括沒有關聯的 `verification`）都出現在 `db.query`；每張表只能由一個 part 宣告；每個 relation 都要寫明 `from` / `to`。
- 環境變數一律透過 `env.ts` 的函式讀取（`postgresEnv()`、`storageEnv()`、`ecpayEnv()` 等，裡面是 `@neon/env` 的 `parseEnv` 或 zod），不要直接讀 `process.env`。Worker 的 binding 從 `cloudflare:workers` 的 `env` 取得。

### 快取

- 前台讀取（`db/queries/products.ts`）包 `unstable_cache`，結果存在 `VINEXT_KV_CACHE`，失效標籤是 `products`、`categories`。會改變這些資料的 server action 寫入後要呼叫 `updateTag('products' | 'categories')`。
- KV 每天只有 1,000 次寫入額度，所以整份型錄只快取一個 key，篩選、搜尋、分頁都在記憶體裡做（`features/products/product-catalog.ts`）。不要改成依查詢參數各開一個 cache key。
- `db/queries/admin/` 不包快取，後台必須看到即時資料。
- `components/layout/Navbar.tsx` 在 server 端讀 session，所以 `(shop)` / `(user)` 所有頁面都是 dynamic、無法被 CDN 快取。這是刻意的取捨，為了避免登入狀態閃爍，不要提議把 session 讀取移出 Navbar。

### 身分驗證與權限

- `lib/auth.ts` 的 `createAuth()`：Better Auth，搭配 admin plugin（角色是 `admin` / `customer`）、KV secondaryStorage 快取 session、`lib/password.ts` 的 PBKDF2 密碼雜湊（預設的 scrypt 會超過 10ms CPU 上限）。
- 讀 session 用 `lib/session.ts` 的 `getSession()` / `getAuth()`，它們以 React `cache()` 讓同一個請求只查一次。
- 權限分三層，缺一不可：
  1. `proxy.ts` 只樂觀檢查 cookie 是否存在，負責轉址。
  2. `app/(admin)/layout.tsx` 檢查角色，不是管理員就顯示 `AccessDenied`。
  3. layout 擋不住頁面資料被序列化送出，server action 也等於公開的 POST endpoint，所以**每個後台頁面和每個 server action** 都要自己呼叫 `getAdminUser()` / `isAdmin()`（`features/admin/shared/admin-guard.ts`）。
- 後台 server action 回傳 `ActionResult`（`features/admin/shared/action-result.ts`）。`'use server'` 檔案只能 export async function。

### 訂單、庫存與金流

- 訂單狀態與付款狀態只能照 `features/orders/order-status.ts` 定義的轉移往前推。後台只有「下一步」按鈕，**不做**可以任意改狀態的編輯表單。
- 狀態轉移的 `UPDATE` 要把允許的前一個狀態寫進 `WHERE`：命中 0 列代表畫面已過期，或有人同時操作。
- 寫入 `order` 表時必須設定 `updatedById`：管理員操作填管理員的 id，顧客結帳或綠界回呼填 `null`。每次狀態變更都要在同一個 transaction 裡寫一筆 `order_event`。
- 結帳時品名、單價、庫存一律在 server 重新查詢。扣庫存用帶條件的 `UPDATE ... WHERE stock >= n`。
- 綠界的兩個回呼共用 `features/payments/ecpay-result.ts`：先驗證 CheckMacValue 與特店編號，再以 `WHERE payment_status = 'unpaid'` 確保只入帳一次；`SimulatePaid=1` 的模擬付款不標記為已付款。綠界 API 細節看 `.claude/skills/ecpay`。
- Worker 跑在 UTC，但日期和訂單編號（`ST-YYYYMMDD-NNNN`）一律以 `Asia/Taipei` 計算。

### 圖片

- 上傳：選檔時只做本機預覽，**送出表單時**才向 server action 要 presigned URL，由瀏覽器直接 PUT 到 Neon Object Storage（範例：`features/admin/products/upload-product-images.ts`）。這樣取消或關掉分頁不會在 bucket 留下孤兒檔。
- 顯示：指向 ImageKit 的 `next/image` 一律給明確的 `width` / `height`，不要用 `fill` 或 `unoptimized`，否則 vinext 不會產生 srcset。唯一例外是 `blob:` 預覽（見 `ProductImagesField.tsx`）。

## vinext / Cloudflare 的地雷

- **頁面和 layout 裡不要呼叫 `redirect()`。** `@vinext/cloudflare` 的 CDN adapter 在內部 fetch 時沒設 `redirect: "manual"`，307 會被 Worker 自己跟隨，無限迴圈後變成 1101 錯誤（`force-dynamic` 也無效）。轉址放在 `proxy.ts`（Next 16 的慣例：檔名是 `proxy.ts`、export `proxy`，不是 `middleware.ts`）。頁面拿不到 session 時要顯示提示畫面，不能轉址。
- `wrangler.jsonc` 頂層的 `cache` 必須維持 `enabled: false`，打開會和 vinext 的 KV cache 衝突。
- 每個請求只有 10ms CPU。I/O（資料庫、`fetch`）不計入，但雜湊、壓縮、大型 JSON 轉換等純運算都要評估成本。
- `router.push()` 到另一個路由時會自動重新取得 server 資料，不需要再接 `router.refresh()`。只有留在同一頁（關掉對話框、完成選單動作）時才需要 `refresh()`。
- 要做成按鈕樣式的連結，用 `<Link className={buttonVariants(...)}>`，不要用 `<Button render={<Link/>}>`：Base UI 的 Button 會強制加上 `role="button"`。

## 看起來像問題、其實是刻意的寫法

- `AuthButton` 在 render 裡呼叫 `authClient.hydrateSession(initialSession)`：這是 Better Auth 文件的寫法。
- 傳給 `memo` 子元件的 handler 包 `useCallback`（例如 `CartList`）：這是刻意的渲染最佳化。
- 後台對話框在成功路徑直接呼叫 `onOpenChange(false)`，繞過會 `form.reset()` 的 wrapper：對話框是每一列各自一個實例，這樣做是為了避免在非同步提交途中清空表單。

## Commit

採用 Conventional Commits：`<type>(<scope>): <subject>`。subject 用英文、祈使句、小寫開頭、不超過 72 字元；scope 取自改動的路徑（`features/cart/**` → `cart`）。commit message 不加 `Co-Authored-By` 或任何 AI 署名。
