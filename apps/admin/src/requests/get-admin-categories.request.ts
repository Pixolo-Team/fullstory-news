// TYPES //
import type { CategoryData } from '@/types/api.types';
import type { RequestResultData } from '@/types/request-result.types';

// SERVICES //
import { sendBackendRequest } from '@/requests/backend.request';

/**
 * Fetches categories with article counts for the admin table.
 * @returns Categories, or an error message when the read failed
 */
export async function getAdminCategoriesRequest(): Promise<RequestResultData<CategoryData[]>> {
  const payload = await sendBackendRequest<CategoryData[]>('/api/admin/categories');

  if (payload.status === 'error' || payload.data === null) {
    return { data: [], errorMessage: payload.message };
  }

  return { data: payload.data, errorMessage: null };
}
