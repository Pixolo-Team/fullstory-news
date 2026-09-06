/**
 * Instagram path segments that embed.js can render.
 *
 * "reels" is the plural form the mobile app shares; Instagram's own embed
 * endpoint only accepts the singular, so it is normalised below.
 */
const EMBEDDABLE_TYPES = ['p', 'reel', 'reels', 'tv'];

/**
 * Reduces a pasted Instagram link to the canonical permalink embed.js needs.
 *
 * Shared links carry tracking parameters (`?igsh=...`) and sometimes a profile
 * prefix (`/username/reel/CODE`). embed.js matches on the bare permalink, so
 * everything except the post type and its shortcode is discarded.
 *
 * @param value - Instagram URL as pasted into the admin
 * @returns Canonical permalink, or null when the link is not embeddable
 */
export function buildInstagramPermalinkService(value: string): string | null {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  if (url.hostname !== 'instagram.com' && !url.hostname.endsWith('.instagram.com')) {
    return null;
  }

  const segments = url.pathname.split('/').filter((segment) => segment.length > 0);
  const typeIndex = segments.findIndex((segment) => EMBEDDABLE_TYPES.includes(segment));

  if (typeIndex === -1) {
    return null;
  }

  const rawType = segments[typeIndex];
  const shortcode = segments[typeIndex + 1];

  if (!shortcode) {
    return null;
  }

  const type = rawType === 'reels' ? 'reel' : rawType;

  return `https://www.instagram.com/${type}/${shortcode}/`;
}
