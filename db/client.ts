import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from 'cloudflare:workers';
import { relations } from '@/db/relations';

export const getDatabase = async (mode: 'cached' | 'fresh' = 'cached') => {
  // 根據 mode 選擇對應的 Hyperdrive 連線字串
  const connectionString =
    mode === 'fresh' ? env.HYPERDRIVE_FRESH.connectionString : env.HYPERDRIVE.connectionString;

  // Create a new client instance for each request.
  const client = new Client({
    connectionString: connectionString,
  });

  // Connect to the database
  await client.connect();

  // Create the Drizzle client with the node-postgres connection
  const db = drizzle({
    client,
    relations,
  });

  return db;
};
