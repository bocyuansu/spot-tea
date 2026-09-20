# spot-tea

台灣茶葉電商，以 [vinext](https://www.npmjs.com/package/vinext)（Next.js 16 相容）建置，
部署在 Cloudflare Workers，資料庫是 Neon Postgres（經 Hyperdrive），
商品圖片放 Neon Object Storage 並由 ImageKit 當 CDN。

## 環境變數

複製 `.env.example` 成 `.env.local` 後填入。`env.ts` 會在啟動時驗證，
少一個或拼錯會當場報錯，不會變成 `undefined` 流進別的地方。

| 變數                                                                                 | 用途                                                                     |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `DATABASE_URL_UNPOOLED`                                                              | Neon 的直連（non-pooled）連線字串，給 migration、seed 與 Better Auth CLI |
| `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE`                           | 本機 dev 時 `HYPERDRIVE` binding 對應的連線字串                          |
| `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE_FRESH`                     | 同上，對應 `HYPERDRIVE_FRESH`                                            |
| `AWS_ENDPOINT_URL_S3` / `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Neon Object Storage，由 `neon env pull` 產生                             |
| `IMAGEKIT_URL_ENDPOINT`                                                              | ImageKit 的 URL endpoint，商品圖片的公開網址前綴                         |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`                                             | Better Auth                                                              |

機密（`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`BETTER_AUTH_SECRET`）
本機放 `.dev.vars`，正式環境用 `wrangler secret put`，不要寫進 `wrangler.jsonc`。

## 資料庫

Schema 在 `db/schema/`（依 auth / product / order 分檔），
關聯在 `db/relations/`（每個 domain 一個 `defineRelationsPart`，於 `index.ts` 淺層合併）。

```sh
pnpm db:generate   # 由 db/schema/ 產生 SQL migration 到 drizzle/
pnpm db:migrate    # 套用未執行的 migration（走 DATABASE_URL_UNPOOLED）
pnpm db:seed       # upsert db/seed-data.ts 的分類、商品與示範訂單，可重複執行
```

Worker 有兩個 Hyperdrive binding：`HYPERDRIVE` 有查詢快取，`HYPERDRIVE_FRESH` 沒有。
後台、結帳與會員訂單一律走 `fresh`，前台的商品查詢走快取那一條並外包一層
`unstable_cache`（結果存進 `VINEXT_KV_CACHE`）。

Hyperdrive 在正式環境負責連線池；Worker 每個請求建立一個短命的 `pg` client。
Hyperdrive 的來源請用 Neon 的直連 host，不要用 `-pooler` 的那個。

## 開發

```sh
pnpm dev           # vinext dev server
pnpm build         # 建置 Cloudflare Worker 輸出到 dist/
pnpm start         # 用 wrangler 在本機跑建置後的 Worker
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

## 專案結構

- `app/` —— 路由。`(shop)` / `(user)` 共用 `SiteChrome`（導覽列 + 頁尾），
  `(auth)` 是乾淨的置中表單，`(admin)` 是側邊欄後台。
- `features/<feature>/` —— 該功能專屬的 components / schemas / actions。
- `components/ui/` —— 只放 shadcn/ui 的原生元件，保持可以重新產生。
- `components/common/`、`components/layout/` —— 專案自己寫的共用元件。
- `db/queries/` —— 查詢；`db/queries/admin/` 底下一律走 `fresh` 連線。
- `lib/` —— auth、密碼雜湊、格式化、S3 client 等共用模組。

## 幾個容易踩到的點

- **頁面裡不要用 `redirect()`**。Cloudflare 的 CDN adapter 會自己追著 307 跑，
  最後變成 1101「Too many redirects」。轉址寫在根目錄的 `proxy.ts`。
- 密碼雜湊用 PBKDF2 而不是 scrypt：Workers 免費方案每個請求只有 10ms CPU。
  迭代次數不能超過 100,000（workerd 的硬性上限，只在 production 生效）。
- 商品圖片由瀏覽器透過 presigned URL 直接 PUT 到物件儲存，不經過 Worker，
  而且是在表單送出時才上傳，取消編輯不會留下沒人用的檔案。
