// CONSTANTS //
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/common/constants/pagination.constants.js';

/**
 * Normalises page and limit values supplied by a caller.
 * @param page - Requested page number
 * @param limit - Requested page size
 * @returns Clamped page and limit values
 */
export function getPaginationUtil(page?: number, limit?: number): { page: number; limit: number } {
  return {
    page: Math.max(page ?? DEFAULT_PAGE, DEFAULT_PAGE),
    limit: Math.min(Math.max(limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE),
  };
}
