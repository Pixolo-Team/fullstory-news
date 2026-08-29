/** Default page number when a caller omits it. */
export const DEFAULT_PAGE = 1;

/** Default page size when a caller omits it. */
export const DEFAULT_PAGE_SIZE = 20;

/** Hard ceiling on page size, so a caller cannot request the whole table. */
export const MAX_PAGE_SIZE = 100;

/** Rolling window, in days, used to calculate trending articles. */
export const TRENDING_WINDOW_DAYS = 7;
