import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from 'cloudflare:workers';
import { cache } from 'react';
import { relations } from '@/db/schema';

// 透過 React cache 確保「單次請求（Per-Request）」內只會建立一個 Pool

export const getDatabase = cache((mode: 'cached' | 'fresh' = 'cached') => {
  // 檢查 Hyperdrive 連線字串是否存在，避免在不正確的環境中崩潰
  if (!env.HYPERDRIVE.connectionString) {
    throw new Error('Hyperdrive connection string 不存在 Cloudflare:workers env.');
  }

  // 根據 mode 選擇對應的 Hyperdrive 連線字串
  const connectionString =
    mode === 'fresh' ? env.HYPERDRIVE_FRESH.connectionString : env.HYPERDRIVE.connectionString;

  // maxUses: 1，確保每一條 PostgreSQL connection 使用一次後，就不再繼續使用。
  const pool = new Pool({
    connectionString,
    maxUses: 1,
  });

  // Create the Drizzle client with the node-postgres connection
  const db = drizzle({
    client: pool,
    relations,
  });

  return db;
});
