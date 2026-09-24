# 找茶 spot-tea

個人獨立開發的台灣茶葉電商。從瀏覽商品、購物車、結帳、綠界信用卡付款，
到會員中心與後台出貨管理，完整走完一筆訂單的生命週期。
以 vinext（Next.js App Router 相容）打造，部署在 Cloudflare Workers。

**Demo：<https://spot-tea.cyuan.workers.dev>**

> 信用卡付款串接的是綠界測試環境，可用綠界公開的測試卡號 `4311-9522-2222-2222`
> （安全碼任意三碼、有效期限任意未來月年、3D 驗證碼 `1234`）走完付款流程。

<!-- 截圖待補：放進 docs/screenshots/ -->

![首頁](docs/screenshots/home.png)

| 商品頁                                   | 結帳                                               |
| ---------------------------------------- | -------------------------------------------------- |
| ![商品頁](docs/screenshots/product.png)  | ![結帳](docs/screenshots/checkout.png)             |
| **會員訂單**                             | **後台訂單管理**                                   |
| ![會員訂單](docs/screenshots/orders.png) | ![後台訂單管理](docs/screenshots/admin-orders.png) |

## 專案亮點

- **完整的電商流程**：顧客下單付款、管理員備貨出貨、顧客查詢與取消訂單，前後台都實際串到資料庫與金流。
- **重視資料正確性**：庫存在資料庫端以帶條件的 `UPDATE` 扣減，防止超賣；
  訂單狀態只能依序往前推，每一次變更都留下操作紀錄。
- **真實金流串接**：綠界全方位金流信用卡付款，處理 CheckMacValue 驗證、重複通知與付款失敗重付。
- **在嚴格限制下做架構取捨**：Cloudflare Workers 免費方案每個請求只有 10ms CPU、
  KV 每天只有 1,000 次寫入，密碼雜湊、快取策略與圖片上傳都依此設計。
- **型別安全延伸到邊界**：環境變數、表單與 server action 的輸入都經過 zod 驗證，
  Drizzle ORM 讓資料庫 schema 與查詢結果的型別保持一致。

## 功能

**顧客**

- 首頁依茶區選購、最新上架；商品列表可依茶區篩選、邊打邊搜、分頁
- 商品頁依重量選規格、加入收藏
- 購物車、結帳、門市資訊
- 付款方式：綠界信用卡、貨到付款、ATM 匯款；滿 NT$1,500 免運，未滿收 NT$120

**會員中心**

- 修改名稱與密碼、裁切後上傳大頭貼
- 我的訂單：查看處理進度，出貨前可自行取消
- 商品收藏

**管理後台**

- 儀表板：已付款營收、訂單數、會員數、上架商品數，以及最新訂單與低庫存提醒
- 商品管理：多重量規格、圖片上傳、批次上下架與刪除；商品分類管理
- 訂單管理：依步驟推進訂單與付款狀態
- 會員管理：新增會員、調整角色、停權，並列出每位會員的累計消費
- 所有表格皆支援搜尋、排序與分頁

Email 驗證與忘記密碼已實作（Resend 寄信），因尚未綁定自訂網域，暫未啟用。

## 技術棧

| 類別       | 技術                                                      |
| ---------- | --------------------------------------------------------- |
| 框架       | vinext（Next.js App Router 相容，以 Vite 建置）、React 19 |
| 執行環境   | Cloudflare Workers                                        |
| 資料庫     | Neon Postgres、Drizzle ORM、Cloudflare Hyperdrive         |
| 快取       | Workers KV                                                |
| 身分驗證   | Better Auth（含 admin plugin）                            |
| 檔案儲存   | Neon Object Storage（S3 相容）、ImageKit CDN              |
| 金流       | 綠界全方位金流（AIO）                                     |
| 寄信       | Resend                                                    |
| UI         | Tailwind CSS、shadcn/ui、TanStack Table                   |
| 表單與驗證 | React Hook Form、zod                                      |
| 測試       | Vitest                                                    |
| 開發工具   | TypeScript、pnpm、oxlint、oxfmt                           |

## 系統架構

```mermaid
flowchart LR
  B["瀏覽器"] -->|"頁面、server action"| W["Cloudflare Worker<br/>vinext"]
  W -->|"Hyperdrive 連線池"| DB[("Neon Postgres")]
  W <-->|"session、商品快取"| KV[("Workers KV")]
  B -->|"presigned URL 直接上傳"| S3[("Neon Object Storage")]
  S3 --> IK["ImageKit CDN"]
  IK -->|"依尺寸輸出圖片"| B
  B -->|"表單 POST"| EC["綠界金流"]
  EC -->|"付款結果回呼"| W
```

- **Cloudflare Workers**：頁面、server action 與 API 都跑在同一個 Worker 上，
  並固定在離資料庫最近的區域（`aws:ap-southeast-1`）。
- **Hyperdrive**：Worker 的每個請求都是短暫的執行環境，由 Hyperdrive 維持到 Neon 的連線池，
  省下每次重新建立連線的成本。
- **Workers KV**：快取 Better Auth 的 session，以及前台的商品與分類清單。
  資料庫仍是唯一的真實來源，商品、分類或庫存變動時以標籤讓快取失效。
- **Neon Object Storage + ImageKit**：商品圖與大頭貼由瀏覽器直接上傳，
  對外經 ImageKit CDN 依螢幕尺寸產生 srcset。

## 技術挑戰與解法

### 1. 結帳：防止超賣與竄改價格

**問題**：購物車存在瀏覽器，送來的價格不可信；兩位顧客同時搶最後一件商品時，
「先讀庫存、算好再寫回」會發生 lost update。

**做法**：

- client 只送規格與數量，品名、單價與庫存一律在 server 從資料庫重新查詢。
  價格有變動時，帶回最新單價請顧客確認後再送出。
- 扣庫存用帶條件的 `UPDATE ... SET stock = stock - n WHERE stock >= n`，由資料庫原子相減。
  後到的那筆命中 0 列，整筆交易連同已扣的庫存一起 rollback，顧客會看到庫存不足的提示。

### 2. 訂單狀態機：禁止跳步，擋下併發操作

**問題**：後台若提供可任意編輯的表單，狀態可能被改錯、也無從追查是誰改的；
兩位管理員同時操作，或其中一人的畫面已經過期時，會互相覆蓋。

**做法**：

- 訂單狀態只能依序往前推（待處理 → 備貨中 → 已出貨 → 已完成，出貨前可取消），
  付款狀態獨立記錄（未付款 → 已付款 → 已退款）。後台只有「下一步」按鈕，沒有編輯表單。
- 允許的前一個狀態直接寫進 `UPDATE` 的 `WHERE`，業務規則也一併放進條件
  （信用卡與 ATM 匯款要先付款才能備貨，貨到付款例外）。畫面過期或同時操作只會命中 0 列，
  回傳「訂單狀態已經變更，請重新整理」。
- 在同一筆交易裡寫入 `order_event`，記下每一次變更與操作的管理員；取消訂單時補回庫存。

### 3. 綠界金流：重複與不保證順序的付款通知

**問題**：綠界會把付款結果同時送到 ReturnURL（server 對 server）與 OrderResultURL（導回瀏覽器），
兩者內容相同、不保證誰先到，通知也可能重送。

**做法**：

- 兩個端點共用同一段處理：先驗證 CheckMacValue 與特店編號，
  再以 `WHERE payment_status = 'unpaid'` 回寫。先到的寫入，後到與重送的命中 0 列，
  不會重複入帳，也不會重複記錄歷程。
- 綠界後台「模擬付款」產生的通知（`SimulatePaid=1`）沒有真的收到錢，不會標記為已付款。
- 付款失敗或中途離開時，訂單維持未付款，可在訂單完成頁重新付款。

### 4. 追進框架原始碼，找出正式環境的重導向迴圈

**問題**：會員中心在本機一切正常，部署後卻出現 Cloudflare 1101 錯誤「Too many redirects」。

**原因**：追進 `@vinext/cloudflare` 的 CDN adapter 原始碼後發現，
它把頁面渲染交給另一個啟用快取的 Worker 入口，而這個內部 `fetch` 漏設了 `redirect: "manual"`
（同一套件的其他內部請求都有設）。頁面回傳的 307 因此被 Worker 自己跟隨，
重新渲染同一頁、再回 307，直到超過重導向上限。

**做法**：頁面不再呼叫 `redirect()`，登入與權限的轉址移到 `proxy.ts`（middleware）。
它執行在不經內部轉送的入口，307 能正常回到瀏覽器。頁面本身只負責在 session 失效時顯示提示畫面。

### 5. 在 Workers 免費方案的限制下設計

- **每個請求只有 10ms CPU**：Better Auth 預設的 scrypt 在 Workers 上要花數百 ms，登入必定超時。
  改用 Web Crypto 原生的 PBKDF2 覆寫密碼雜湊，迭代次數存進 hash 本身，之後調整也不會讓舊密碼失效。
  （Workers 的 PBKDF2 迭代上限只在正式環境生效，本機測不出來，這點也寫進了註解。）
- **KV 每天只有 1,000 次寫入**：若為每組篩選參數開一個 cache key，任何人亂打的關鍵字都會多消耗一次寫入。
  改成整份型錄只快取一個 key，茶區篩選、關鍵字搜尋與分頁都在記憶體中完成。
- **圖片上傳不經過 Worker**：server 只簽發 presigned URL，瀏覽器直接 PUT 到物件儲存，
  不佔用 Worker 的 CPU 與請求大小限制。

### 6. 時區

Worker 執行在 UTC，但訂單日期與訂單編號（`ST-YYYYMMDD-NNNN`）都應以台灣時間計算。
日期一律以 `Asia/Taipei` 計算與顯示，避免午夜前後的訂單被算到前一天。

## 資料模型

- `user` / `session` / `account` / `verification`：Better Auth 的資料表，含 admin plugin 的角色與停權欄位。
- `category` / `product` / `product_variant`：商品依重量分規格，價格與庫存記在規格上。
- `order` / `order_item` / `order_event`：訂單狀態與付款狀態分開記錄；
  訂單明細保存下單當下的品名與單價；`order_event` 記錄每一次狀態變更與操作者。
- `favorite`：以 (user_id, product_id) 為複合主鍵。

## 測試

單元測試放在被測模組旁（`*.test.ts`），以 Vitest 執行，著重在出錯代價高的商業規則：
運費計算、訂單狀態轉移、訂單編號、綠界 CheckMacValue、密碼雜湊、
登入後的安全轉址（防止 open redirect），以及各表單的 zod schema。

## 專案結構

依功能（feature-based）組織：路由檔保持精簡，每個功能的元件、schema、server action
與商業邏輯放在同一個資料夾。

```text
app/          路由：(shop) 前台、(user) 會員中心、(auth) 登入註冊、(admin) 後台、api/ 金流回呼
features/     各功能模組：cart、checkout、orders、payments、products、favorites、user、admin
components/   共用元件：ui/（shadcn/ui）、common/、layout/
db/           Drizzle schema、relations、queries
lib/          auth、session、密碼雜湊、S3 client、ImageKit 等共用模組
proxy.ts      登入與權限檢查、轉址
```

## 本機執行

需要 Node.js、pnpm，以及 Neon 與 Cloudflare 帳號。

```sh
pnpm install
cp .env.example .env.local   # 填入環境變數
pnpm db:migrate
pnpm db:seed                 # 寫入示範分類與商品
pnpm dev                     # http://localhost:3000
```
