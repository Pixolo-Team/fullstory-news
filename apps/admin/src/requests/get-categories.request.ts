// TYPES //
import type { CategoryData } from '@/types/api.types';
import type { RequestResultData } from '@/types/request-result.types';

// SERVICES //
import { sendBackendRequest } from '@/requests/backend.request';

/**
 * Fetches the public category list used by Story forms.
 * @returns Categories, or an error message when the read failed
 */
export async function getCategoriesRequest(): Promise<RequestResultData<CategoryData[]>> {
  const payload = await sendBackendRequest<CategoryData[]>('/api/categories');

  if (payload.status === 'error' || payload.data === null) {
    return { data: [], errorMessage: payload.message };
  }

  return { data: payload.data, errorMessage: null };
}
