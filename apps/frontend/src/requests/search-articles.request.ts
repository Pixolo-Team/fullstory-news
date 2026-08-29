// TYPES //
import type { ArticleData, PaginatedData } from '@/types/api.types';

// SERVICES //
import { sendBackendRequest } from '@/requests/backend.request';

/**
 * Searches published Stories.
 * @param query - Search term
 * @param page - Page number
 * @returns Matching Stories
 */
export async function searchArticlesRequest(
  query: string,
  page = 1,
): Promise<PaginatedData<ArticleData>> {
  const searchParams = new URLSearchParams({ q: query, page: String(page) });
  const payload = await sendBackendRequest<PaginatedData<ArticleData>>(
    `/api/search?${searchParams.toString()}`,
  );

  return payload.data ?? { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };
}
