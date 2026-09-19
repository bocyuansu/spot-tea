import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // 與 tsconfig.json 的 paths 對齊，被測模組才能和 app 程式碼一樣用 @/ 匯入
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['**/*.{test,spec}.{ts,tsx}'],
  },
});
