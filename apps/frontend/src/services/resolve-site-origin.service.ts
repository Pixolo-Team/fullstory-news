const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];
const PRODUCTION_ORIGIN = 'https://www.fullstorynews.com';

/**
 * Resolves the public site origin for canonical URLs, shares and JSON-LD.
 *
 * Astro.url can look local on the Vercel deployment even in production, so a
 * configured PUBLIC_SITE_URL wins, then a production fallback, then the request.
 *
 * @param requestUrl - The current request URL
 * @param configuredSiteUrl - PUBLIC_SITE_URL when set
 * @returns Absolute origin with no trailing slash
 */
export function resolveSiteOriginService(requestUrl: URL, configuredSiteUrl?: string): string {
  const requestOrigin = requestUrl.origin;
  const configuredOrigin = configuredSiteUrl ? new URL(configuredSiteUrl).origin : null;
  const configuredHost = configuredOrigin ? new URL(configuredOrigin).hostname : '';
  const requestHost = new URL(requestOrigin).hostname;

  if (configuredOrigin && !LOCAL_HOSTS.includes(configuredHost)) {
    return configuredOrigin;
  }

  if (LOCAL_HOSTS.includes(requestHost)) {
    return PRODUCTION_ORIGIN;
  }

  return requestOrigin;
}
