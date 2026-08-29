/**
 * Converts free text into a URL-safe slug.
 * @param value - The source text to normalise
 * @returns A lowercase slug safe for URLs
 */
export function toSlugUtil(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
