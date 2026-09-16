import { toNextJsHandler } from 'better-auth/next-js';
import { createAuth } from '@/lib/auth';

export function POST(request: Request) {
  const auth = createAuth();

  return toNextJsHandler(auth).POST(request);
}

export async function GET(request: Request) {
  const auth = createAuth();

  return toNextJsHandler(auth).GET(request);
}
