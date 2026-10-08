// TYPES //
import type { ArticleListItemData } from '@/modules/articles/articles.types.js';

/**
 * Author profile shown on a public byline page.
 *
 * Email is deliberately absent. `AuthorData` carries it for admin callers,
 * but a public profile must not publish a contact address scraped straight
 * from the login record.
 */
export interface AuthorProfileData {
  id: string;
  slug: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
}

/** An author profile together with that author's published Stories. */
export interface AuthorPageData {
  author: AuthorProfileData;
  stories: ArticleListItemData[];
}
