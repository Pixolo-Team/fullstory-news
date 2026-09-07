// TYPES //
import type { APIRoute } from 'astro';

// SERVICES //
import { sendBackendRequest } from '@/requests/backend.request';
import { getCategoriesRequest } from '@/requests/get-categories.request';

interface SitemapArticleData {
  slug: string;
  id: string;
  updatedAt: string;
}

const STATIC_PATHS = ['/', '/search', '/privacy-policy', '/terms', '/grievance'];

/** Stories are paginated at the backend's page size; walk every page. */
const PAGE_SIZE = 100;

/**
 * Fetches every published Story's sitemap fields, across all pages.
 *
 * The public site never has an "all published Stories" endpoint of its own,
 * so this walks `GET /articles` the same way a reader's listing page would —
 * published-only by default, one page at a time.
 *
 * @returns Slug, id and last-updated timestamp for every published Story
 */
async function fetchAllPublishedArticles(): Promise<SitemapArticleData[]> {
  const articles: SitemapArticleData[] = [];
  let page = 1;

  while (true) {
    const payload = await sendBackendRequest<{
      items: SitemapArticleData[];
      totalPages: number;
    }>(`/api/articles?page=${page}&limit=${PAGE_SIZE}`);

    const items = payload.data?.items ?? [];
    articles.push(...items);

    const totalPages = payload.data?.totalPages ?? 0;
    if (page >= totalPages || items.length === 0) {
      break;
    }

    page += 1;
  }

  return articles;
}

/**
 * Escapes the handful of characters XML disallows unescaped in text content.
 * @param value - Raw string
 * @returns XML-safe string
 */
function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Serves the sitemap listing every public route: static pages, Categories,
 * and every published Story. Generated per-request rather than at build time
 * because Stories publish continuously and the site is SSR throughout.
 *
 * @param context - Astro endpoint context
 * @returns XML sitemap response
 */
export const GET: APIRoute = async ({ url }) => {
  // On this Vercel deployment, an API route's own `url.origin` resolves to
  // "https://localhost" even on a fresh, uncached invocation - a page
  // component's Astro.url.origin does not have this problem, only a plain
  // API route does. Verified directly: fetching this endpoint with a
  // cache-busting query string still returned localhost URLs. Falling back
  // to the same PUBLIC_SITE_URL / production-host logic BaseLayout already
  // uses for the identical class of problem, since that is proven correct
  // across the rest of this site.
  const configuredSiteUrl = import.meta.env.PUBLIC_SITE_URL;
  const localHosts = ['localhost', '127.0.0.1', '::1'];
  const configuredOrigin = configuredSiteUrl ? new URL(configuredSiteUrl).origin : null;
  const configuredHost = configuredOrigin ? new URL(configuredOrigin).hostname : '';
  const requestHost = url.hostname;
  const origin =
    configuredOrigin && !localHosts.includes(configuredHost)
      ? configuredOrigin
      : localHosts.includes(requestHost)
        ? 'https://www.fullstorynews.com'
        : url.origin;

  const [categories, articles] = await Promise.all([
    getCategoriesRequest(),
    fetchAllPublishedArticles(),
  ]);

  const urls = [
    ...STATIC_PATHS.map((path) => ({ loc: `${origin}${path}`, lastmod: undefined })),
    ...categories.map((category) => ({ loc: `${origin}/${category.slug}`, lastmod: undefined })),
    ...articles.map((article) => ({
      loc: `${origin}/story/${article.slug}`,
      lastmod: article.updatedAt,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) =>
      `  <url>\n    <loc>${escapeXml(url.loc)}</loc>${
        url.lastmod ? `\n    <lastmod>${escapeXml(url.lastmod)}</lastmod>` : ''
      }\n  </url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
};
