---
paths:
  - '**/*.tsx'
  - 'features/admin/products/upload-product-images.ts'
---

# React 元件與圖片

## 元件放置

- `components/ui/` 只放 shadcn/ui primitive（Base UI 版本）。自己寫的共用元件放 `components/common/`，PascalCase 檔名、每檔一個 `export default function`。

## 按鈕樣式的連結

用 `buttonVariants()` 套在 `Link` 上。Base UI 的 `Button` 會強制加上 `role="button"`，連結的語意會跑掉。

```tsx
// 正確
<Link href="/products" className={buttonVariants({ variant: 'outline' })}>
  逛逛茶品
</Link>

// 錯誤
<Button render={<Link href="/products" />}>逛逛茶品</Button>
```

## 圖片

指向 ImageKit 的 `next/image` 一律給明確的 `width` / `height`，vinext 才會產生 srcset。唯一例外是上傳前的 `blob:` 預覽（見 `ProductImagesField.tsx`）。

```tsx
// 正確
<Image src={image.url} alt={product.name} width={600} height={600} />

// 錯誤：fill 或 unoptimized 都不會產生 srcset
<Image src={image.url} alt={product.name} fill />
```

上傳流程：選檔時只做本機預覽，**送出表單時**才向 server action 要 presigned URL，由瀏覽器直接 PUT 到 Neon Object Storage（範例：`features/admin/products/upload-product-images.ts`）。這樣取消或關掉分頁不會在 bucket 留下孤兒檔。

## 路由與資料更新

- `router.push()` 到另一個路由時會自動重新取得 server 資料，後面不需要接 `router.refresh()`。
- 留在同一頁（關掉對話框、完成選單動作）時才呼叫 `router.refresh()`。

## 看起來像問題、其實是刻意的寫法

以下寫法請維持原樣，review 時也不要列為問題：

- `AuthButton` 在 render 裡呼叫 `authClient.hydrateSession(initialSession)`：這是 Better Auth 文件的寫法。
- 傳給 `memo` 子元件的 handler 包 `useCallback`（例如 `CartList`）：這是刻意的渲染最佳化。
- 後台對話框在成功路徑直接呼叫 `onOpenChange(false)`，繞過會 `form.reset()` 的 wrapper：對話框是每一列各自一個實例，這樣做是為了避免在非同步提交途中清空表單。
