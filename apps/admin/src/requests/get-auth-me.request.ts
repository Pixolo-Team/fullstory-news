// TYPES //
import type { AdminUserData } from '@/types/api.types';

// SERVICES //
import { sendBackendRequest } from '@/requests/backend.request';

/**
 * Fetches the authenticated admin user.
 * @returns Current admin user, or null when unauthenticated
 */
export async function getAuthMeRequest(): Promise<AdminUserData | null> {
  const payload = await sendBackendRequest<AdminUserData>('/api/auth/me');
  return payload.data;
}
