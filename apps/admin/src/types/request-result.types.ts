/**
 * Result of a backend read.
 *
 * Requests never throw, so pages can render a real error instead of an empty
 * list. An empty `items` with a null `errorMessage` genuinely means no rows;
 * an `errorMessage` means the data could not be fetched at all.
 */
export interface RequestResultData<T> {
  data: T;
  errorMessage: string | null;
}
