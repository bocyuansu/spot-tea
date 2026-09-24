# spot-tea（找茶）

台灣茶葉電商，以 [vinext](https://www.npmjs.com/package/vinext)（Next.js 16 相容）建置，
部署在 Cloudflare Workers，資料庫是 Neon Postgres（經 Hyperdrive），
圖片放 Neon Object Storage 並由 ImageKit 當 CDN，金流串接綠界。

## 功能

- **前台**：首頁（依茶區選購、最新上架）、商品列表（茶區篩選、邊打邊搜、分頁）、
  商品頁（依重量選規格、收藏）、購物車（存在 localStorage）、結帳、門市資訊。
- **會員中心**：修改名稱與密碼、裁切後上傳大頭貼、我的訂單（出貨前可自行取消）、商品收藏。
- **付款方式**：綠界信用卡、貨到付款、ATM 匯款。滿 NT$1,500 免運，未滿收 NT$120。
- **後台**（`role = admin`）：儀表板、商品管理（規格、圖片、批次上下架與刪除）、商品分類、
  訂單管理、使用者管理（新增、改角色、停權）。每張表都能搜尋、排序、分頁。
- **Email 驗證與忘記密碼**：程式寫好了，但目前沒有自訂網域，暫時關閉（見「部署」）。

## 技術棧

| 項目     | 使用                                                                       |
| -------- | -------------------------------------------------------------------------- |
| 框架     | vinext（Next.js App Router 相容，跑在 Vite 上）、React 19                  |
| 部署     | Cloudflare Workers（`@vinext/cloudflare`）                                 |
| 資料庫   | Neon Postgres + Cloudflare Hyperdrive、Drizzle ORM 1.0 RC（relations v2）  |
| 登入     | Better Auth（email + 密碼、admin plugin），session 快取在 Workers KV       |
| 圖片     | Neon Object Storage（S3 相容）、ImageKit                                   |
| 金流     | 綠界全方位金流（AIO）信用卡                                                |
| 寄信     | Resend                                                                     |
| UI       | Tailwind CSS、shadcn/ui（base-nova）、TanStack Table、react-hook-form、zod |
| 開發工具 | TypeScript、oxlint、oxfmt、Vitest、pnpm                                    |

## 快速開始

```sh
pnpm install
cp .env.example .env.local   # 填入下方的環境變數
pnpm db:migrate
pnpm db:seed
pnpm dev                     # http://localhost:3000
```

- **第一個管理員**：admin plugin 的預設角色是 `customer`，後台的新增會員與改角色又都需要管理員身分，
  所以第一個管理員要先註冊，再到資料庫把該使用者的 `role` 改成 `admin`。
- `db:seed` 的示範訂單會掛在 `db/seed-data.ts` 的 `seedOrderUserEmail` 帳號底下，
  該帳號還沒註冊時只會跳過訂單，分類與商品照常寫入。

## 環境變數

複製 `.env.example` 成 `.env.local` 後填入。程式一律經由 `env.ts` 讀取，不直接碰 `process.env`：
Neon 的變數交給 `@neon/env` 的 `parseEnv`，其餘用 zod 驗證，少一個或格式錯會直接報錯，
不會變成 `undefined` 流進別的地方。

| 變數                                                                                 | 用途                                                                                  |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `DATABASE_URL_UNPOOLED`                                                              | Neon 的直連（non-pooled）連線字串，給 migration、seed、drizzle-kit 與 Better Auth CLI |
| `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE`                           | 本機 dev 時 `HYPERDRIVE` binding 對應的連線字串                                       |
| `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE_FRESH`                     | 同上，對應 `HYPERDRIVE_FRESH`                                                         |
| `AWS_ENDPOINT_URL_S3` / `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Neon Object Storage，由 `neon env pull` 產生                                          |
| `IMAGEKIT_URL_ENDPOINT`                                                              | ImageKit 的 URL endpoint（origin 指在 bucket 根目錄），圖片公開網址的前綴             |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`                                             | Better Auth                                                                           |
| `RESEND_API_KEY` / `EMAIL_FROM`                                                      | Resend，寄註冊驗證信與重設密碼信；寄件網域要先在 Resend 驗證                          |
| `ECPAY_MERCHANT_ID` / `ECPAY_HASH_KEY` / `ECPAY_HASH_IV`                             | 綠界特店資料；`.env.example` 附的是綠界公開的測試特店                                 |
| `ECPAY_MODE`                                                                         | `stage`（預設）或 `production`，決定送單到綠界的測試或正式付款頁                      |

本機開發時所有變數（含機密）都放 `.env.local`：Node 腳本用 dotenv 讀它，
dev server 裡的 Worker 則由 Cloudflare 的 Vite plugin 讀（官方的做法是 `.dev.vars` 與 `.env*` 擇一，
這個專案用後者）。

正式環境的非機密變數寫在 `wrangler.jsonc` 的 `vars`；機密
（`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`BETTER_AUTH_SECRET`、`RESEND_API_KEY`、
`ECPAY_HASH_KEY`、`ECPAY_HASH_IV`）用 `wrangler secret put` 設定，不要寫進 `wrangler.jsonc`。

## Cloudflare bindings

| Binding            | 用途                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| `HYPERDRIVE_FRESH` | Hyperdrive，不快取查詢。目前所有查詢都走這一條                          |
| `HYPERDRIVE`       | Hyperdrive，有查詢快取。是 `getDatabase()` 的預設值，但目前沒有程式使用 |
| `VINEXT_KV_CACHE`  | vinext 的資料快取，存放 `unstable_cache` 的結果                         |
| `AUTH_KV`          | Better Auth 的 `secondaryStorage`，快取 session                         |
| `IMAGES`           | vinext `next/image` 的站內圖片最佳化                                    |
| `ASSETS`           | 建置後的靜態檔（`dist/client`）                                         |

Worker 固定放在 Neon 資料庫所在的 `aws:ap-southeast-1`（配合 Hyperdrive，不用 smart placement），
Workers Cache 保持關閉，否則會和 vinext 的 KV 快取衝突。

## 資料庫

Schema 在 `db/schema/`（依 auth / product / order / favorite 分檔），
關聯在 `db/relations/`（每個 domain 一個 `defineRelationsPart`，於 `index.ts` 淺層合併）。

- `user` / `session` / `account` / `verification`：Better Auth 的表，含 admin plugin 的角色與停權欄位。
- `category` / `product` / `product_variant`：商品依重量分規格，價格與庫存記在規格上。
- `order` / `order_item` / `order_event`：訂單狀態與付款狀態分開記錄；明細存下單當下的品名與單價快照；
  `order_event` 留下每一次狀態變更與操作的管理員。
- `favorite`：以 (user_id, product_id) 為複合主鍵。

```sh
pnpm db:generate   # 由 db/schema/ 產生 SQL migration 到 drizzle/
pnpm db:migrate    # 套用未執行的 migration（走 DATABASE_URL_UNPOOLED）
pnpm db:seed       # upsert db/seed-data.ts 的分類、商品與示範訂單，可重複執行
```

Better Auth 的表由它的 CLI 產生：`pnpm dlx auth@latest generate --config lib/auth-cli.ts`。
CLI 在純 Node 裡跑，載不進會用到 Worker binding 的 `lib/auth.ts`，所以另有一份 `lib/auth-cli.ts`；
新增會建表或加欄位的 plugin 時，兩邊的 `plugins` 要同步。

### 連線與快取

- Hyperdrive 在正式環境負責連線池，Worker 每個請求建立一個短命的 `pg` client。
  Hyperdrive 的來源請用 Neon 的直連 host，不要用 `-pooler` 的那個。
- 所有查詢都走 `fresh`：後台、結帳、會員訂單與收藏都要看到當下的資料。
- 前台的商品與分類清單（`db/queries/products.ts`）外包一層 `unstable_cache`，結果存進
  `VINEXT_KV_CACHE`，掛 `products` / `categories` 標籤、一小時重新驗證。
  改到商品、分類或庫存的 server action（後台編輯、結帳扣庫存、取消補庫存）會用 `updateTag` 清掉。
- 茶區篩選、關鍵字、分頁與商品頁的 slug 都是在記憶體裡篩選整份型錄，不另開 cache key：
  Free 方案的 KV 每天只有 1,000 次寫入，任何人亂打的參數都會多一次寫入。
- Session 由 `lib/session.ts` 以 React 的 `cache()` 包起來，每個請求只查一次。
  `AUTH_KV` 只是快取，session 仍以資料庫為主；KV 沒有原子操作，所以驗證碼留在資料庫、
  rate limit 用記憶體。

## 訂單與付款

- **訂單狀態**：待處理 → 備貨中 → 已出貨 → 已完成，出貨前可取消（顧客或後台皆可），取消時補回庫存。
- **付款狀態**：未付款 → 已付款 → 已退款。信用卡與 ATM 匯款要先付款才能開始備貨，貨到付款例外。
- 後台只能按按鈕把狀態往下一步推，沒有編輯表單。允許的前一個狀態直接寫進 `UPDATE` 的條件，
  畫面過期或兩人同時操作只會命中 0 列；每一步在同一筆交易裡寫一筆 `order_event`，
  並把操作者記到 `updatedById`。規則表在 `features/orders/order-status.ts`。
- **結帳**：client 只送規格與數量，品名、單價與庫存一律從資料庫重撈。合計和顧客看到的不同時
  會帶回最新單價請顧客確認；扣庫存用帶條件的 `UPDATE`（`stock >= quantity`）在資料庫端相減，防止超賣。
  訂單編號是 `ST-YYYYMMDD-NNNN`，日期以台北時間計。
- **綠界信用卡**：訂單以未付款成立，完成頁由 server action 算好帶 CheckMacValue 的欄位，
  再由瀏覽器以表單 POST 到綠界付款頁。付款結果由 `/api/payments/ecpay/notify`（ReturnURL）
  與 `/api/payments/ecpay/result`（OrderResultURL）回寫，先到的那個寫入，重複的通知不會重複入帳；
  模擬付款的通知不會標記已付款。付款失敗或中途離開時訂單仍是未付款，可以在完成頁重付。
- 回呼網址跟著請求的 Origin 走，而綠界只打得到公開的 80/443 網址，本機測試付款要開 tunnel。
- 貨到付款、ATM 匯款與綠界要求人工確認的交易，由後台手動標記已付款；退款要先在綠界後台或銀行完成，
  後台只記錄結果。

## 開發

```sh
pnpm dev           # vinext dev server（http://localhost:3000）
pnpm build         # 建置 Cloudflare Worker 輸出到 dist/
pnpm start         # 用 wrangler 在本機跑建置後的 Worker（http://localhost:8787）
pnpm preview       # build + start
pnpm deploy        # 部署到 Cloudflare
pnpm cf-typegen    # 重新產生 Cloudflare binding 的型別
```

## 檢查

```sh
pnpm typecheck     # tsc --noEmit
pnpm lint          # oxlint
pnpm format        # oxfmt（含 .css）
pnpm format:check
pnpm test          # vitest
```

單元測試（`*.test.ts`）放在被測模組旁邊，著重在運費、訂單狀態、訂單編號、CheckMacValue、
密碼雜湊、登入後轉址這類商業規則。Commit 訊息採用 Conventional Commits。

## 部署

```sh
pnpm build
pnpm deploy
```

- `wrangler.jsonc` 裡的 Hyperdrive 與 KV id 屬於目前的 Cloudflare 帳號，換帳號要重新建立並換掉 id。
- 網域寫死在幾個地方，換網域時要一起改：`lib/auth.ts` 的 `baseURL.allowedHosts`、
  `app/sitemap.ts` 與 `app/robots.txt`。
- **綠界上線**：把 `wrangler.jsonc` 的 `ECPAY_MERCHANT_ID` 換成正式特店、`ECPAY_MODE` 改成 `production`，
  HashKey / HashIV 用 `wrangler secret put` 換成正式的。
- **開啟 Email 功能**：在 Resend 驗證網域並改掉 `EMAIL_FROM`（`onboarding@resend.dev` 只寄得到
  Resend 帳號本人的信箱），再把 `lib/auth.ts` 的 `requireEmailVerification`、`sendOnSignUp`、
  `sendOnSignIn` 打開，並拿掉 `app/(auth)/forgot-password/page.tsx` 的 `closeFeature`。

## 專案結構

- `app/` —— 路由。`(shop)` 前台與 `(user)` 會員中心共用 `SiteChrome`（導覽列 + 頁尾），
  `(auth)` 是乾淨的置中表單，`(admin)` 是側邊欄後台；`api/auth` 是 Better Auth，
  `api/payments/ecpay` 接綠界的回呼。
- `features/<feature>/` —— 該功能專屬的 components / schemas / actions 與商業邏輯。
  `features/admin/` 再依 domain 分成 products / categories / orders / users / dashboard / shared。
- `components/ui/` —— 只放 shadcn/ui 的原生元件，保持可以重新產生。
- `components/common/`、`components/layout/` —— 專案自己寫的共用元件。
- `db/schema/`、`db/relations/`、`db/queries/` —— schema、關聯與查詢；`db/queries/admin/` 給後台用。
  `drizzle/` 是產生出來的 migration。
- `lib/` —— auth、session、密碼雜湊、寄信、格式化、S3 client、ImageKit 網址等共用模組。
- `env.ts` / `neon.ts` —— 環境變數驗證，以及 Neon 的分支政策（宣告 `images` bucket）。
- `proxy.ts` —— `/user`、`/checkout`、`/admin` 的登入檢查與轉址。
- `.claude/skills/ecpay/` —— 綠界的 Claude skill（vendored，oxfmt / oxlint 都略過）。

## 幾個容易踩到的點

- **頁面裡不要用 `redirect()`**。Cloudflare 的 CDN adapter 會自己追著 307 跑，
  最後變成 1101「Too many redirects」。轉址寫在根目錄的 `proxy.ts`。
  同樣的原因，驗證信與重設密碼信的連結直接指向站內頁面，不走 Better Auth 會 302 的 GET 端點。
- **`proxy.ts` 只樂觀檢查 cookie**，真正的身分確認在頁面與 server action 裡：
  server action 等同公開的 POST endpoint，每個都要自己確認身分；後台 layout 顯示 `AccessDenied`
  也擋不住頁面資料被序列化進 RSC payload，所以每個後台頁面在查詢前都要呼叫 `getAdminUser()`。
- 密碼雜湊用 PBKDF2 而不是 scrypt：Workers 免費方案每個請求只有 10ms CPU。
  迭代次數不能超過 100,000（workerd 的硬性上限，只在 production 生效）。
- 商品圖片與大頭貼由瀏覽器透過 presigned URL 直接 PUT 到物件儲存，不經過 Worker。
  商品圖片在表單送出時才上傳，取消編輯不會留下沒人用的檔案。
- 指向 ImageKit 的 `next/image` 要給明確的 `width` / `height`，不要用 `fill` 或 `unoptimized`，
  vinext 才會交給 unpic 產生 ImageKit 的 srcset。
- Worker 跑在 UTC，日期一律以 `Asia/Taipei` 計算與顯示（`lib/format.ts`、訂單編號、綠界的交易時間）。
