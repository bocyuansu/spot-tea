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
    images: [
      '/assets/spot-tea.jpg',
      '/assets/dong-ding-oolong-01.avif',
      '/assets/dong-ding-oolong-02.avif',
    ],
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
    images: ['/assets/spot-tea.jpg'],
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
    images: ['/assets/spot-tea.jpg'],
    status: 'published',
    origin: '大禹嶺',
    variants: [{ weightGrams: 300, label: '禮盒組', sku: 'DYL-GIFT-300', price: 3200, stock: 5 }],
  },
];
