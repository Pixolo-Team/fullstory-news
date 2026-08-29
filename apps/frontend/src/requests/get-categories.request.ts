// TYPES //
import type { CategoryData } from '@/types/api.types';

// SERVICES //
import { sendBackendRequest } from '@/requests/backend.request';

/**
 * Fetches the category list used by the header and footer.
 * @returns Categories, or an empty list when the API is unreachable
 */
export async function getCategoriesRequest(): Promise<CategoryData[]> {
  const payload = await sendBackendRequest<CategoryData[]>('/api/categories');
  return payload.data ?? [];
}
