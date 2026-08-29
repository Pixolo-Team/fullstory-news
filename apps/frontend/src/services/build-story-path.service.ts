// TYPES //
import type { ArticleData } from '@/types/api.types';

/**
 * Builds the public URL for a Story.
 *
 * The route is /story/[slug]/[id] - the id disambiguates, so slugs need not
 * be unique.
 *
 * @param article - Story to link to
 * @returns Public Story path
 */
export function buildStoryPathService(article: Pick<ArticleData, 'slug' | 'id'>): string {
  return `/story/${article.slug}/${article.id}`;
}
