import type { ArticleDetailData, CategoryData } from '@/types/api.types';

/** Schema.org JSON-LD document rendered as a script tag. */
export interface JsonLdData {
  '@context': string;
  '@graph'?: Record<string, unknown>[];
  '@type'?: string;
  [key: string]: unknown;
}

interface BreadcrumbItemData {
  name: string;
  item: string;
}

/**
 * Builds Organization JSON-LD used as a publisher and as a home-page entity.
 * @param siteOrigin - Public site origin
 * @param siteName - Publisher display name
 * @returns Organization node
 */
function buildOrganizationData(siteOrigin: string, siteName: string): Record<string, unknown> {
  return {
    '@type': 'Organization',
    '@id': `${siteOrigin}/#organization`,
    name: siteName,
    url: siteOrigin,
    logo: {
      '@type': 'ImageObject',
      url: `${siteOrigin}/favicon-512.png`,
    },
  };
}

/**
 * Builds a BreadcrumbList from ordered trail items.
 * @param items - Trail from the site root to the current page
 * @returns BreadcrumbList node
 */
function buildBreadcrumbListData(items: BreadcrumbItemData[]): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

/**
 * Builds home-page JSON-LD: WebSite with SearchAction plus Organization.
 * @param siteOrigin - Public site origin
 * @param siteName - Publisher display name
 * @returns JSON-LD document
 */
export function buildHomeJsonLdService(siteOrigin: string, siteName: string): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteOrigin}/#website`,
        url: siteOrigin,
        name: siteName,
        publisher: { '@id': `${siteOrigin}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteOrigin}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      buildOrganizationData(siteOrigin, siteName),
    ],
  };
}

/**
 * Builds category listing JSON-LD: CollectionPage plus breadcrumbs.
 * @param siteOrigin - Public site origin
 * @param category - Category being listed
 * @param canonicalUrl - Canonical category URL
 * @param description - Category intro used as the page description
 * @returns JSON-LD document
 */
export function buildCategoryJsonLdService(
  siteOrigin: string,
  category: CategoryData,
  canonicalUrl: string,
  description: string,
): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: category.name,
        description,
        url: canonicalUrl,
      },
      buildBreadcrumbListData([
        { name: 'Home', item: siteOrigin },
        { name: category.name, item: canonicalUrl },
      ]),
    ],
  };
}

/**
 * Builds Story JSON-LD: NewsArticle with nested publisher plus breadcrumbs.
 * @param siteOrigin - Public site origin
 * @param siteName - Publisher display name
 * @param article - Full Story payload
 * @param canonicalUrl - Canonical Story URL
 * @returns JSON-LD document
 */
export function buildStoryJsonLdService(
  siteOrigin: string,
  siteName: string,
  article: ArticleDetailData,
  canonicalUrl: string,
): JsonLdData {
  const imageUrl = article.heroImageUrl
    ? new URL(article.heroImageUrl, siteOrigin).toString()
    : undefined;
  const publishedTime = article.publishedAt ?? article.updatedAt;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        headline: article.headline,
        description: article.subHeadline ?? article.headline,
        image: imageUrl ? [imageUrl] : undefined,
        datePublished: publishedTime,
        dateModified: article.updatedAt,
        author: { '@type': 'Person', name: article.author.name },
        publisher: buildOrganizationData(siteOrigin, siteName),
        articleSection: article.category.name,
        keywords: article.tags.length > 0 ? article.tags.join(', ') : undefined,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
      },
      buildBreadcrumbListData([
        { name: 'Home', item: siteOrigin },
        {
          name: article.category.name,
          item: `${siteOrigin}/${article.category.slug}`,
        },
        { name: article.headline, item: canonicalUrl },
      ]),
    ],
  };
}

/**
 * Builds search-page JSON-LD as a SearchResultsPage.
 * @param canonicalUrl - Canonical search URL
 * @param query - Current search term, empty when none
 * @returns JSON-LD document
 */
export function buildSearchJsonLdService(canonicalUrl: string, query: string): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: query ? `Search results for ${query}` : 'Search',
    url: canonicalUrl,
  };
}
