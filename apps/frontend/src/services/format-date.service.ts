/**
 * Formats a publication date for display.
 * @param value - ISO timestamp
 * @returns Readable date, or an empty string when unset
 */
export function formatDateService(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}
