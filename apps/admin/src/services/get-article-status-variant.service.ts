// TYPES //
import type { ArticleStatusData } from '@/types/api.types';

/**
 * Maps an article status to the badge variant used in admin lists.
 * @param status - Publishing status of the article
 * @returns Badge variant name
 */
export function getArticleStatusVariantService(
  status: ArticleStatusData,
): 'default' | 'secondary' {
  return status === 'published' ? 'default' : 'secondary';
}
