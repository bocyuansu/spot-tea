import { defineRelationsPart } from 'drizzle-orm';

import * as schema from '@/db/schema';

import { authRelations } from './auth';
import { productRelations } from './product';
import { orderRelations } from './order';
import { favoriteRelations } from './favorite';

// 官方 Rule 2：只用 part 的專案，其中一個 part 要是空的（不傳 callback），
// drizzle 才能推導出 schema 內的每一張表。沒宣告任何關聯的表格（例如 verification）
// 也才會出現在 db.query 上。
const mainPart = defineRelationsPart(schema);

/**
 * 官方 Rule 1：mainPart 要排在最前面，後面的 part 才覆蓋得掉它。
 *
 * 每個 part 只宣告自己「擁有」的表格，合併時才不會互相覆蓋 ——
 * spread 是以資料表為單位的淺層覆蓋，同一張表出現在兩個 part 會整組被蓋掉而不是合併。
 *
 * 另外 defineRelationsPart 只會在同一個 part 裡找反向關聯來推導欄位，
 * 所以跨 part 的關聯（例如 user.orders）兩邊都要自己寫明 from／to。
 */
export const relations = {
  ...mainPart,
  ...authRelations,
  ...productRelations,
  ...orderRelations,
  ...favoriteRelations,
};
