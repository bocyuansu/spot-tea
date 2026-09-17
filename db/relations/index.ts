import { authRelations } from './auth';
import { productRelations } from './product';
import { cartRelations } from './cart';
import { orderRelations } from './order';

/**
 * 每個 part 只宣告自己「擁有」的表格，合併時才不會互相覆蓋 ——
 * spread 是以資料表為單位的淺層覆蓋，同一張表出現在兩個 part 會整組被蓋掉而不是合併。
 *
 * 另外 defineRelationsPart 只會在同一個 part 裡找反向關聯來推導欄位，
 * 所以跨 part 的關聯（例如 user.cart）兩邊都要自己寫明 from／to。
 */
export const relations = {
  ...authRelations,
  ...productRelations,
  ...cartRelations,
  ...orderRelations,
};
