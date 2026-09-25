---
paths:
  - 'app/*admin*/**'
  - 'app/*auth*/**'
  - 'app/api/auth/**'
  - 'features/admin/**'
  - 'features/auth/**'
  - 'lib/auth*.ts'
  - 'lib/session.ts'
  - 'lib/password.ts'
  - 'proxy.ts'
---

# 身分驗證與後台權限

## 身分驗證

- `lib/auth.ts` 的 `createAuth()`：Better Auth，搭配 admin plugin（角色是 `admin` / `customer`）、KV secondaryStorage 快取 session、`lib/password.ts` 的 PBKDF2 密碼雜湊。
- 讀 session 用 `lib/session.ts` 的 `getSession()` / `getAuth()`。它們以 React `cache()` 包起來，同一個請求重複呼叫只查一次，可以放心在頁面和 layout 各呼叫一次。

## 權限三層，缺一不可

1. `proxy.ts` 只樂觀檢查 cookie 是否存在，負責轉址。
2. `app/(admin)/layout.tsx` 檢查角色，不是管理員就顯示 `AccessDenied`。
3. **每個後台頁面和每個 server action** 在查詢或寫入前都自己呼叫 `getAdminUser()` / `isAdmin()`（`features/admin/shared/admin-guard.ts`）。
   原因：頁面會被獨立序列化進 RSC payload，layout 擋不住資料送出；server action 則等於公開的 POST endpoint。

需要記錄「誰操作的」（例如寫入 `order.updatedById`）用 `getAdminUser()`，只要判斷身分用 `isAdmin()`。

## 後台 server action 的寫法

- 回傳 `ActionResult`（`features/admin/shared/action-result.ts`），失敗時給使用者看得懂的繁體中文訊息。
- `'use server'` 檔案只能 export async function，型別和常數放在其他檔案。

正確寫法：

```ts
'use server';

export async function updateCategory(
  id: string,
  values: CategoryFormValues,
): Promise<ActionResult> {
  if (!(await isAdmin()))
    return { ok: false, message: '沒有權限執行這個操作 !' };

  const parsed = categoryFormSchema.safeParse(values);
  if (!parsed.success)
    return { ok: false, message: '欄位格式有誤，請重新檢查 !' };

  const db = await getDatabase('fresh');
  // ...寫入，命中 0 列時回傳失敗而不是成功

  updateTag('categories');
  return { ok: true };
}
```

## 步驟：新增一個後台功能

1. zod schema 放 `features/admin/<domain>/schemas/`，表單和 action 共用。
2. server action 放 `features/admin/<domain>/actions/`，照上面的寫法：權限 → `safeParse` → 寫入 → `updateTag`（若影響前台）→ `ActionResult`。
3. 頁面放 `app/(admin)/admin/<domain>/page.tsx`，查詢前先 `getAdminUser()`，不是管理員就 `return null`（提示畫面由 layout 的 `AccessDenied` 負責）；讀取用 `db/queries/admin/`（不包快取）。
4. 元件放 `features/admin/<domain>/components/`，名稱不加 `Admin` 前綴。
