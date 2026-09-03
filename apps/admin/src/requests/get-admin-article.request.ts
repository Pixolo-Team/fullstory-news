// TYPES //
import type { ArticleDetailData } from '@/types/api.types';

// SERVICES //
import { sendBackendRequest } from '@/requests/backend.request';

/**
 * Fetches one article for editing.
 *
 * Under articles/id/:id on the backend, not a bare articles/:id - that path
 * is now the public route that looks a Story up by slug instead.
 *
 * @param id - Article id
 * @returns Full article detail or null when not found
 */
export async function getAdminArticleRequest(id: string): Promise<ArticleDetailData | null> {
  const payload = await sendBackendRequest<ArticleDetailData>(`/api/articles/id/${id}`);
  return payload.data;
}
