// 格線是 2／3／4 欄，12 在每種寬度下都能排滿整列
export const PRODUCTS_PAGE_SIZE = 12;

type SearchableProduct = {
  name: string;
  origin: string | null;
  category: { name: string } | null;
};

// NFKC 把輸入法打出的全形英數（ＧＡＢＡ）轉成半形，再轉小寫，比對時才不分全半形與大小寫
function normalizeSearchText(text: string) {
  return text.normalize('NFKC').toLowerCase();
}

/**
 * 只比對卡片上看得到的名稱、產地、分類，使用者才看得出每筆結果為什麼符合。
 *
 * 在記憶體裡篩選已快取的型錄，關鍵字不進 unstable_cache：
 * 每個不同的參數都是一個 KV key，任何人亂打的關鍵字都會多一次 KV 寫入，
 * Cloudflare Free 方案每天只有 1,000 次。
 */
export function searchProducts<T extends SearchableProduct>(
  products: T[],
  query: string,
) {
  const keyword = normalizeSearchText(query.trim());
  if (!keyword) return products;

  return products.filter((product) =>
    [product.name, product.origin, product.category?.name].some(
      (field) => field && normalizeSearchText(field).includes(keyword),
    ),
  );
}

/**
 * 網址上的 page 任何人都能改：不是正整數就回到第一頁，超過總頁數就停在最後一頁。
 * 沒有結果時仍算一頁，頁碼顯示才不會出現「第 1 / 0 頁」
 */
export function paginate<T>(
  items: T[],
  requestedPage: number,
  pageSize = PRODUCTS_PAGE_SIZE,
) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    totalPages,
  };
}

type ProductsHrefParams = {
  category?: string;
  query?: string;
  page?: number;
};

// 第一頁不帶 page，讓「全部」「清除搜尋」等連結和直接打開 /products 是同一個網址
export function getProductsHref({ category, query, page }: ProductsHrefParams) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (query) params.set('q', query);
  if (page && page > 1) params.set('page', String(page));

  const search = params.toString();
  return search ? `/products?${search}` : '/products';
}
