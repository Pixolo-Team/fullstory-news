// TYPES //
import type { ApiResponseData } from '@/common/types/api-response.types.js';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';

// CONSTANTS //
import { SUCCESS_MESSAGE } from '@/common/constants/messages.constants.js';

// LIBRARIES //
import { Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

/**
 * Wraps every successful controller return value in the response envelope.
 *
 * Controllers return plain data. This is the only place the success envelope is
 * built, so no controller can drift from the shape.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponseData<T>> {
  /**
   * Maps a controller result into the standard envelope
   * @param context - Nest execution context, used to read the status code
   * @param next - The downstream handler
   * @returns An observable emitting the wrapped response
   */
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponseData<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => ({
        data: data ?? null,
        status: 'success' as const,
        status_code: response.statusCode,
        message: SUCCESS_MESSAGE,
        error: null,
      })),
    );
  }
}
