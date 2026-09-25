---
paths:
  - 'db/**'
  - 'drizzle/**'
  - 'drizzle.config.ts'
  - 'lib/auth.ts'
  - 'lib/auth-cli.ts'
---

# 資料庫與 Drizzle

## 連線

- 取得連線一律寫 `await getDatabase('fresh')`（走 `HYPERDRIVE_FRESH`，沒有查詢快取）。
- `db/client.ts` 每次呼叫都 new 一個 `pg.Client` 經 Hyperdrive 連線、不呼叫 `end()`，這是 Cloudflare 官方的 Hyperdrive 寫法，**維持原樣不修改**。`'cached'` 模式與 `HYPERDRIVE` binding 是刻意保留的，沒有用到也不要刪。

## Relations

`db/relations/` 每個 domain 一個 `defineRelationsPart`，在 `index.ts` 以淺層 spread 合併：

1. 沒有 callback 的 `mainPart` 排第一個，每張表（包括沒有關聯的 `verification`）才會出現在 `db.query`。
2. 每張表只由一個 part 宣告。spread 是以資料表為單位覆蓋，同一張表出現在兩個 part 會整組被蓋掉。
3. 每個 relation 都寫明 `from` / `to`，因為跨 part 時 Drizzle 推導不到反向關聯。

## 讀寫分工

- 讀取放 `db/queries/`；前台讀取要包快取（見 [caching.md](caching.md)），`db/queries/admin/` 不包快取。
- 寫入放 `features/*/actions/`，不放在 `db/`。

## Better Auth 的 schema

用 `pnpm dlx auth@latest generate --config lib/auth-cli.ts` 產生。`lib/auth.ts` 依賴 `cloudflare:workers`，CLI 無法載入，所以另有給純 Node 用的 `lib/auth-cli.ts`；在 `lib/auth.ts` 加入會動到 schema 的 plugin 時，兩邊要同步修改。

## 步驟：新增或修改資料表

1. 在 `db/schema/<domain>.ts` 定義資料表；新的 domain 檔要在 `db/schema/index.ts` 加上 `export *`。
2. 在 `db/relations/<domain>.ts` 的 part 宣告關聯；新的 part 加進 `db/relations/index.ts` 的 spread（排在 `mainPart` 之後）。
3. `pnpm db:generate` 產生 migration，打開 `drizzle/` 裡新產生的 SQL 確認內容。
4. `pnpm db:migrate` 套用。
5. `pnpm typecheck` 確認 `db.query` 的型別正確。
