/**
 * Formats an ISO timestamp for the admin UI.
 * @param value - ISO timestamp to format
 * @returns Short readable date-time string
 */
export function formatDateService(value: string | null | undefined): string {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
