// LIBRARIES //
import sanitizeHtml from 'sanitize-html';

/**
 * Tags an editor may produce. Anything outside this list is dropped.
 *
 * Allow-list, not deny-list: a pattern that removes known-bad markup is only
 * ever as good as the list of attacks it was written against, and the previous
 * regex implementation let `<img src=x onerror=...>`, unclosed `<script src>`,
 * `<svg onload>` and nested `<scr<script>ipt>` through.
 */
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'blockquote',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'figure',
  'figcaption',
  'hr',
  'code',
  'pre',
  'sup',
  'sub',
];

/**
 * Sanitises article HTML before it is written to storage.
 *
 * The public Story page renders the result with `set:html`, so this is the
 * only barrier between editor input and every reader.
 *
 * @param value - Raw editor HTML
 * @returns Sanitised HTML string safe to persist and render
 */
export function sanitizeHtmlUtil(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    },
    // Only these URL schemes survive, so javascript: and data: payloads are
    // removed however they are spelled or padded.
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    // Anything not in allowedTags has its markup dropped but its text kept, so
    // an editor never silently loses a paragraph of copy.
    disallowedTagsMode: 'discard',
    // External links leave the site; never hand them window.opener.
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  });
}
