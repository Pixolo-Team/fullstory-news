// TYPES //
import type { ArticleDetailData } from '@/types/api.types';

// SERVICES //
import { sendBackendRequest } from '@/requests/backend.request';

/**
 * Fetches one article for editing.
 * @param id - Article id
 * @returns Full article detail or null when not found
 */
export async function getAdminArticleRequest(id: string): Promise<ArticleDetailData | null> {
  const payload = await sendBackendRequest<ArticleDetailData>(`/api/articles/${id}`);
  return payload.data;
}
