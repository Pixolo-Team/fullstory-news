// TYPES //
import type { PaginatedData } from '@/types/api.types';
import type { ArticleData, ArticleStatusData } from '@/types/api.types';

// SERVICES //
import { sendBackendRequest } from '@/requests/backend.request';

/**
 * Fetches article list data for the admin panel.
 * @param query - Optional filters and pagination
 * @returns Paginated article data
 */
export async function getAdminArticlesRequest(query?: {
  status?: ArticleStatusData | 'all';
  q?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedData<ArticleData>> {
  const searchParams = new URLSearchParams();

  if (query?.status) searchParams.set('status', query.status);
  if (query?.q) searchParams.set('q', query.q);
  if (query?.page) searchParams.set('page', String(query.page));
  if (query?.limit) searchParams.set('limit', String(query.limit));

  const payload = await sendBackendRequest<PaginatedData<ArticleData>>(
    `/api/articles${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`,
  );

  return payload.data ?? { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };
}
