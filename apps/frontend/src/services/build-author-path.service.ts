/**
 * Builds the byline page path for an author.
 *
 * The slug is derived from the name rather than stored, matching how the
 * backend resolves `/api/authors/:slug`. Both sides use the same rules, so a
 * byline link and the page it points at always agree.
 *
 * @param name - The author's display name
 * @returns Root-relative path to the author's byline page
 */
export function buildAuthorPathService(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `/author/${slug}`;
}
