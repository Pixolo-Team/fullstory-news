// TYPES //
import type { AuthorPageData, AuthorProfileData } from '@/types/api.types';

// SERVICES //
import { sendBackendRequest } from '@/requests/backend.request';

/**
 * Fetches one author's profile and published Stories.
 * @param slug - Slug derived from the author's name
 * @returns The author page payload, or null when no author matches
 */
export async function getAuthorRequest(slug: string): Promise<AuthorPageData | null> {
  const payload = await sendBackendRequest<AuthorPageData>(`/api/authors/${encodeURIComponent(slug)}`);
  return payload.data;
}

/**
 * Fetches every author profile, used to enumerate byline pages for the sitemap.
 * @returns Author profiles, or an empty list when the API is unreachable
 */
export async function getAuthorsRequest(): Promise<AuthorProfileData[]> {
  const payload = await sendBackendRequest<AuthorProfileData[]>('/api/authors');
  return payload.data ?? [];
}
