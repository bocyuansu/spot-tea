import { defineConfig } from '@neon/config/v1';

/**
 * Neon 的分支政策：宣告這個專案用到哪些服務。
 * 宣告了 buckets，parseEnv 才會（而且才能）給出 env.storage 那一組型別。
 */
export default defineConfig({
  buckets: {
    // 商品圖片與網站素材都放這裡；public_read 代表寫入要憑證、讀取不用，
    // 所以物件網址可以直接當成圖片來源
    images: { access: 'public_read' },
  },
});
