// TYPES //
import type { ArticleData } from '@/types/api.types';

/**
 * Builds the public URL for a Story.
 *
 * The route is /story/[slug] - the backend enforces slug uniqueness
 * (0003_unique_article_slugs.sql), so the id no longer needs to appear here.
 *
 * @param article - Story to link to
 * @returns Public Story path
 */
export function buildStoryPathService(article: Pick<ArticleData, 'slug'>): string {
  return `/story/${article.slug}`;
}
