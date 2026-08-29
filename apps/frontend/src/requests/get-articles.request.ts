// TYPES //
import type { ArticleData, CategoryGroupData, PaginatedData } from '@/types/api.types';

// SERVICES //
import { sendBackendRequest } from '@/requests/backend.request';

/** Empty page used when a listing cannot be loaded. */
const EMPTY_PAGE: PaginatedData<ArticleData> = {
  items: [],
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

/**
 * Fetches the most-viewed Stories of the last seven days.
 * @param limit - Maximum Stories to return
 * @returns Trending Stories
 */
export async function getTrendingArticlesRequest(limit = 3): Promise<ArticleData[]> {
  const payload = await sendBackendRequest<ArticleData[]>(`/api/articles/trending?limit=${limit}`);
  return payload.data ?? [];
}

/**
 * Fetches the most recently published Stories.
 * @param limit - Maximum Stories to return
 * @returns Latest Stories
 */
export async function getLatestArticlesRequest(limit = 8): Promise<ArticleData[]> {
  const payload = await sendBackendRequest<ArticleData[]>(`/api/articles/latest?limit=${limit}`);
  return payload.data ?? [];
}

/**
 * Fetches the latest Stories grouped by Category for the home page.
 * @param limit - Maximum Stories per Category
 * @returns Category groups, empty ones already omitted by the backend
 */
export async function getArticlesByCategoryRequest(limit = 4): Promise<CategoryGroupData[]> {
  const payload = await sendBackendRequest<CategoryGroupData[]>(
    `/api/articles/by-category?limit=${limit}`,
  );
  return payload.data ?? [];
}

/**
 * Fetches a paginated listing, optionally filtered by Category.
 * @param query - Category slug and pagination
 * @returns Paginated Stories
 */
export async function getArticlesRequest(query: {
  category?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedData<ArticleData>> {
  const searchParams = new URLSearchParams();

  if (query.category) searchParams.set('category', query.category);
  if (query.page) searchParams.set('page', String(query.page));
  if (query.limit) searchParams.set('limit', String(query.limit));

  const suffix = searchParams.toString();
  const payload = await sendBackendRequest<PaginatedData<ArticleData>>(
    `/api/articles${suffix ? `?${suffix}` : ''}`,
  );

  return payload.data ?? EMPTY_PAGE;
}

/**
 * Fetches Stories similar to the given one.
 * @param id - Article id
 * @param limit - Maximum Stories to return
 * @returns Similar Stories
 */
export async function getSimilarArticlesRequest(id: string, limit = 3): Promise<ArticleData[]> {
  const payload = await sendBackendRequest<ArticleData[]>(
    `/api/articles/${id}/similar?limit=${limit}`,
  );
  return payload.data ?? [];
}
