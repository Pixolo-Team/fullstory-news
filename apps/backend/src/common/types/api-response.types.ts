/**
 * The response envelope every endpoint returns.
 *
 * Applied by ResponseInterceptor on success and DomainExceptionFilter on
 * failure, so controllers never build it by hand.
 */
export interface ApiResponseData<T> {
  data: T | null;
  status: 'success' | 'error';
  status_code: number;
  message: string;
  error: string | null;
}

/**
 * Envelope for list endpoints. Sits inside ApiResponseData.data.
 */
export interface PaginatedData<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
