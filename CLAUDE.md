# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案

找茶 spot-tea：台灣茶葉電商（前台、會員中心、管理後台、綠界金流），部署在 **Cloudflare Workers 免費方案**。

框架是 **vinext**，用 Vite 重新實作的 Next.js 16 App Router 相容層，不是 Next.js 本身。碰到路由、快取、`next/image` 等行為時，先查 `node_modules/vinext/README.md` 的「API coverage」與「What's NOT supported」，確認支援後再用 Next.js 的慣用寫法。

## 語言與風格

- 程式碼註解、UI 文字用繁體中文；程式碼識別字、指令、技術名詞維持英文。
- 測試的 `describe` / `it` 名稱用英文。
- README 是給面試官與招募者看的作品集介紹，更新時維持「挑戰 → 原因 → 解法」的寫法，寫成作品介紹而不是維運文件。

## 技術棧

| 類別       | 套件                                                                               |
| ---------- | ---------------------------------------------------------------------------------- |
| 框架       | vinext 1.0 beta（Next.js 16 相容）、React 19.3、TypeScript 7                       |
| 部署       | Cloudflare Workers + Hyperdrive + KV（`@vinext/cloudflare`、wrangler）             |
| 資料庫     | Neon Postgres、Drizzle ORM 1.0.0-rc.4（relations v2：`defineRelationsPart`）、`pg` |
| 身分驗證   | Better Auth 1.7（admin plugin）                                                    |
| UI         | Tailwind CSS 4、shadcn/ui（Base UI 1.8 版本，不是 Radix）、Tabler / Lucide icons   |
| 表單與驗證 | react-hook-form 7、zod 4                                                           |
| 其他       | Neon Object Storage（S3 SDK）、ImageKit、Resend、綠界 ECPay                        |
| 工具       | pnpm 11、oxlint、oxfmt、vitest 3                                                   |

## 指令

套件管理用 pnpm。有 script 就用 script；沒有的一次性指令用 `pnpm dlx`。

```sh
pnpm dev                 # 本機開發，http://localhost:3000
pnpm preview             # build 後用 wrangler dev 跑產出的 Worker（localhost:8787）
pnpm deploy              # 部署（需先 pnpm build）
pnpm typecheck           # tsc --noEmit
pnpm lint                # oxlint
pnpm format              # oxfmt（單引號等風格交給它處理）
pnpm test                # vitest run
pnpm test features/orders/order-status.test.ts   # 跑單一檔案
pnpm test -t "calculateShippingFee"               # 依 describe / it 名稱篩選
pnpm db:generate         # 依 db/schema 產生 migration 到 drizzle/
pnpm db:migrate          # 套用 migration（讀 .env.local 的 DATABASE_URL_UNPOOLED）
pnpm db:seed             # 寫入示範分類與商品
pnpm cf-typegen          # 改了 wrangler.jsonc 的 binding 後重新產生 worker-configuration.d.ts
```

改完程式碼後依序跑 `pnpm typecheck`、`pnpm lint`、`pnpm test` 確認。

`pnpm dev` 和 `pnpm preview` 都**不會**套用 Workers 每請求 10ms 的 CPU 上限，也不會套用 PBKDF2 十萬次迭代的上限，這兩者只能在部署後的 Worker 上驗證。

## 目錄分工

- `app/`：路由保持精簡，只負責組裝。route group 分成 `(shop)` 前台、`(user)` 會員中心、`(auth)` 登入註冊、`(admin)` 後台；`api/auth/[...all]` 是 Better Auth，`api/payments/ecpay/{notify,result}` 是綠界回呼。
- `features/<feature>/`：功能的 `actions/`（server action）、`components/`、`schemas/`（zod），加上純邏輯模組。單元測試 `*.test.ts` 放在被測模組旁邊。
- `features/admin/` 依 domain 分子資料夾（`products`、`categories`、`orders`、`users`、`dashboard`、`shared`），裡面的元件直接命名（`ProductTable`，不是 `AdminProductTable`），路徑已經說明了用途。
- `components/ui/` 只放 shadcn/ui primitive，保持隨時可以用 shadcn 重新產生。專案自己寫的共用元件放 `components/common/`（PascalCase 檔名，每檔一個 `export default function`）。
- `db/`：`schema/`（Drizzle 資料表）、`relations/`、`queries/`（讀取）。寫入放在 `features/*/actions`。
- 環境變數一律透過 `env.ts` 的函式讀取（`postgresEnv()`、`storageEnv()`、`ecpayEnv()` 等）；Worker 的 binding 從 `cloudflare:workers` 的 `env` 取得。

## 全域地雷（vinext / Cloudflare）

- **轉址一律放在 `proxy.ts`**（Next 16 的慣例：檔名 `proxy.ts`、export `proxy`）。頁面和 layout 拿不到 session 時顯示提示畫面，不呼叫 `redirect()`。
  原因：`@vinext/cloudflare` 的 CDN adapter 內部 fetch 沒設 `redirect: "manual"`，頁面回的 307 會被 Worker 自己跟隨，無限迴圈後變成 1101 錯誤（`force-dynamic` 也無效）。
- **每個請求只有 10ms CPU。** I/O（資料庫、`fetch`）不計入，但雜湊、壓縮、大型 JSON 轉換等純運算都要先評估成本。密碼雜湊因此用 `lib/password.ts` 的 PBKDF2，而不是 Better Auth 預設的 scrypt。
- `wrangler.jsonc` 頂層的 `cache` 維持 `enabled: false`，打開會和 vinext 的 KV cache 衝突。
- `components/layout/Navbar.tsx` 在 server 端讀 session，所以 `(shop)` / `(user)` 所有頁面都是 dynamic、無法被 CDN 快取。這是為了避免登入狀態閃爍而刻意做的取捨，維持現狀。

## 領域規則

各領域的細節拆在 `.claude/rules/`，處理對應路徑的檔案時會自動載入：

- [資料庫與 Drizzle](.claude/rules/database.md)：`db/client.ts`、relations 合併規則、新增資料表的步驟
- [前台快取](.claude/rules/caching.md)：`unstable_cache`、KV 寫入額度、`updateTag`
- [身分驗證與後台權限](.claude/rules/auth-and-admin.md)：三層權限、後台 server action 的寫法與步驟
- [訂單、庫存與金流](.claude/rules/orders-and-payments.md)：狀態轉移、併發控制、綠界回呼
- [React 元件與圖片](.claude/rules/components.md)：`next/image`、按鈕連結、`router`、刻意的寫法
- 綠界 API 細節看 [.claude/skills/ecpay](.claude/skills/ecpay)

## Commit

採用 Conventional Commits：`<type>(<scope>): <subject>`。subject 用英文、祈使句、小寫開頭、不超過 72 字元；scope 取自改動的路徑（`features/cart/**` → `cart`）。commit message 只寫變更內容，不加 `Co-Authored-By` 或任何 AI 署名。
