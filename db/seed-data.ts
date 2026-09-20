// 初始商品資料：由 db/seed.ts 寫入資料庫，作為前台商品頁的唯一資料來源
export const seedCategories = [
  { name: '南投鹿谷', slug: 'nantou-lugu' },
  { name: '阿里山', slug: 'alishan' },
  { name: '坪林文山', slug: 'pinglin-wenshan' },
  { name: '大禹嶺', slug: 'dayuling' },
];

type SeedProduct = {
  categorySlug: string;
  name: string;
  slug: string;
  description: string;
  /** 圖片檔名，seed.ts 會換算成 ImageKit 的公開網址再寫進資料庫 */
  images: string[];
  status: 'draft' | 'published' | 'archived';
  origin: string;
  variants: {
    weightGrams: number;
    label: string | null;
    sku: string;
    price: number;
    stock: number;
  }[];
};

export const seedProducts: SeedProduct[] = [
  {
    categorySlug: 'nantou-lugu',
    name: '凍頂烏龍茶',
    slug: 'dong-ding-oolong',
    description: '香氣濃郁、喉韻回甘的經典凍頂烏龍。',
    images: ['spot-tea.jpg'],
    status: 'published',
    origin: '南投鹿谷',
    variants: [
      { weightGrams: 150, label: null, sku: 'DDOL-150', price: 680, stock: 20 },
      { weightGrams: 600, label: null, sku: 'DDOL-600', price: 2280, stock: 8 },
    ],
  },
  {
    categorySlug: 'alishan',
    name: '阿里山金萱茶',
    slug: 'alishan-jinxuan',
    description: '帶有奶香與淡淡花香的高山茶。',
    images: ['spot-tea.jpg'],
    status: 'published',
    origin: '阿里山',
    variants: [{ weightGrams: 150, label: null, sku: 'ALJX-150', price: 780, stock: 15 }],
  },
  {
    categorySlug: 'pinglin-wenshan',
    name: '文山包種茶',
    slug: 'wenshan-baozhong',
    description: '清香淡雅，適合日常沖泡的輕發酵茶。',
    images: [],
    status: 'published',
    origin: '坪林文山',
    variants: [{ weightGrams: 150, label: null, sku: 'WSBZ-150', price: 520, stock: 0 }],
  },
  {
    categorySlug: 'dayuling',
    name: '大禹嶺高山茶禮盒',
    slug: 'dayuling-gift-box',
    description: '產量稀少的高冷茶，適合送禮的精緻禮盒組。',
    images: ['spot-tea.jpg'],
    status: 'published',
    origin: '大禹嶺',
    variants: [{ weightGrams: 300, label: '禮盒組', sku: 'DYL-GIFT-300', price: 3200, stock: 5 }],
  },
];

// 初始訂單資料：掛在這位使用者底下，用來讓會員中心的訂單紀錄有東西可看
// 使用者本身由 Better Auth 註冊產生，seed 不會建立，找不到時直接略過訂單
export const seedOrderUserEmail = 'cyuan666@test.com';

type SeedOrder = {
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded';
  paymentProvider: string | null;
  paymentTransactionId: string | null;
  shippingFee: number;
  shippingAddress: {
    recipientName: string;
    phone: string;
    postalCode: string;
    city: string;
    district: string;
    addressLine: string;
  };
  note: string | null;
  // 固定日期而非相對天數，重跑 seed 時訂單時間才不會跟著今天飄移
  createdAt: Date;
  // 只記 sku 與數量，品名與單價在 seed 時從商品資料快照過去
  items: { sku: string; quantity: number }[];
};

const seedShippingAddress = {
  recipientName: 'Cyuan Su',
  phone: '0912345678',
  postalCode: '106',
  city: '台北市',
  district: '大安區',
  addressLine: '信義路四段 1 號 8 樓',
};

export const seedOrders: SeedOrder[] = [
  {
    orderNumber: 'ST-20260712-0001',
    status: 'completed',
    paymentStatus: 'paid',
    paymentProvider: 'ecpay',
    paymentTransactionId: 'ECPAY-20260712-0001',
    shippingFee: 0,
    shippingAddress: seedShippingAddress,
    note: '請用禮盒包裝，謝謝。',
    createdAt: new Date('2026-07-12T10:24:00+08:00'),
    items: [
      { sku: 'DYL-GIFT-300', quantity: 1 },
      { sku: 'DDOL-150', quantity: 2 },
    ],
  },
  {
    orderNumber: 'ST-20260828-0002',
    status: 'shipped',
    paymentStatus: 'paid',
    paymentProvider: 'ecpay',
    paymentTransactionId: 'ECPAY-20260828-0002',
    shippingFee: 120,
    shippingAddress: seedShippingAddress,
    note: null,
    createdAt: new Date('2026-08-28T20:05:00+08:00'),
    items: [{ sku: 'ALJX-150', quantity: 1 }],
  },
  {
    orderNumber: 'ST-20260915-0003',
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentProvider: null,
    paymentTransactionId: null,
    shippingFee: 120,
    shippingAddress: seedShippingAddress,
    note: '平日白天不在家，麻煩改送晚上。',
    createdAt: new Date('2026-09-15T09:41:00+08:00'),
    items: [
      { sku: 'DDOL-600', quantity: 1 },
      { sku: 'WSBZ-150', quantity: 3 },
    ],
  },
];
