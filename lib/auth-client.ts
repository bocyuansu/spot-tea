import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';
import { adminRoles } from '@/lib/permissions';

export const authClient = createAuthClient({
  // roles 要和 lib/auth.ts 的 admin plugin 給同一份，型別推斷才會一致
  plugins: [adminClient({ roles: adminRoles })],
});
