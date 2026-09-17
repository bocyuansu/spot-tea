import { toNextJsHandler } from 'better-auth/next-js';
import { createAuth } from '@/lib/auth';

export async function POST(request: Request) {
  const auth = await createAuth();

  return toNextJsHandler(auth).POST(request);
}

export async function GET(request: Request) {
  const auth = await createAuth();

  return toNextJsHandler(auth).GET(request);
}
