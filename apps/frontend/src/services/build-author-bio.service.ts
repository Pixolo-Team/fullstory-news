/**
 * Byline-page copy shared by every author who has no bio of their own.
 *
 * Kept here rather than written into the `bio` column so that an empty column
 * means "no bio yet" rather than "the same paragraph as everyone else". The
 * moment a real bio is saved against an author it takes precedence, with no
 * code change.
 */

/**
 * Builds the standing description shown on an author's byline page.
 * @param name - The author's display name
 * @returns A short biography paragraph naming the author
 */
export function buildAuthorBioService(name: string): string {
  return `${name} writes for Full Story, covering the day's news for readers who want to understand what happened without reading a newspaper to find out. Stories carry a byline and a date, draw on reporting that is named and linked, and are corrected in public when they need to be.`;
}

/**
 * Builds the meta description for an author's byline page.
 * @param name - The author's display name
 * @returns A one-line description for search results and link previews
 */
export function buildAuthorMetaDescriptionService(name: string): string {
  return `Stories by ${name} for Full Story.`;
}
