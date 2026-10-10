/**
 * Cookie consent storage key and analytics gating.
 *
 * The banner persists the reader's choice in localStorage (same mechanism as
 * the theme preference) so no server-side cookie handling is needed.
 */
export const COOKIE_CONSENT_STORAGE_KEY = 'fs-cookie-consent';

/** Reader choice stored under COOKIE_CONSENT_STORAGE_KEY. */
export const COOKIE_CONSENT_ACCEPTED = 'accepted';
export const COOKIE_CONSENT_REJECTED = 'rejected';

/** Loaded only in production so local dev and preview traffic never reaches Analytics. */
export const GA_MEASUREMENT_ID = 'G-3FMBG1EGMQ';

/** Production host that is allowed to load analytics after consent. */
export const PRODUCTION_HOST = 'www.fullstorynews.com';
