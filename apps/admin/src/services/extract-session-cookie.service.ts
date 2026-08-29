/**
 * Extracts the `fs_session` cookie value from a Set-Cookie header.
 * @param setCookieHeader - Raw Set-Cookie header returned by the backend
 * @returns Cookie value when present
 */
export function extractSessionCookieService(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) {
    return null;
  }

  const match = setCookieHeader.match(/fs_session=([^;]+)/);

  if (!match?.[1]) {
    return null;
  }

  const encodedValue = match[1].replace(/^"|"$/g, '');

  try {
    return decodeURIComponent(encodedValue);
  } catch {
    return encodedValue;
  }
}
