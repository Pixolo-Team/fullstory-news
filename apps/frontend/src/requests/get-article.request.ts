// TYPES //
import type { ArticleDetailData } from '@/types/api.types';

// SERVICES //
import { sendBackendRequest } from '@/requests/backend.request';

/**
 * Fetches one published Story. Recording the view happens backend-side.
 * @param slug - Story slug, unique per Story
 * @returns The Story, or null when it is missing or unpublished
 */
export async function getArticleRequest(slug: string): Promise<ArticleDetailData | null> {
  const payload = await sendBackendRequest<ArticleDetailData>(`/api/articles/${slug}`);
  return payload.data;
}
