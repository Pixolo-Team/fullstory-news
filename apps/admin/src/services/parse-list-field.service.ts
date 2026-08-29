/**
 * Parses a comma- or line-separated text field into clean string values.
 * @param value - Raw form field value
 * @returns Trimmed non-empty strings
 */
export function parseListFieldService(value: FormDataEntryValue | null): string[] {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
