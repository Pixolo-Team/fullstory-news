// TYPES //
import type { ApiResponseData } from '@/common/types/api-response.types.js';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

// CONSTANTS //
import { INTERNAL_ERROR_MESSAGE } from '@/common/constants/messages.constants.js';

// UTILS //
import { DomainError } from '@/common/errors/domain.error.js';

// LIBRARIES //
import { Catch, HttpException, Logger } from '@nestjs/common';

/**
 * Maps every thrown error to the standard response envelope.
 *
 * Three cases, in order:
 *   DomainError    - thrown by a service. Its statusCode and message are used.
 *   HttpException  - thrown by Nest itself, e.g. ValidationPipe. Passed through.
 *   anything else  - unexpected. Logged in full, reported as a generic 500 so
 *                    internal detail never reaches the client.
 */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  /**
   * Converts a thrown error into the response envelope
   * @param exception - The thrown value, of unknown type
   * @param host - Nest execution context, used to reach the HTTP response
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof DomainError) {
      this.logger.warn(`${exception.code}: ${exception.message}`);
      response.status(exception.statusCode).json(
        this.buildEnvelope(exception.statusCode, exception.message),
      );
      return;
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      response.status(statusCode).json(
        this.buildEnvelope(statusCode, this.extractHttpMessage(exception)),
      );
      return;
    }

    // Unexpected. Log everything, tell the client nothing.
    this.logger.error(
      exception instanceof Error ? exception.message : 'Non-error thrown',
      exception instanceof Error ? exception.stack : undefined,
    );
    response.status(500).json(this.buildEnvelope(500, INTERNAL_ERROR_MESSAGE));
  }

  /**
   * Builds the standard error envelope
   * @param statusCode - HTTP status to report
   * @param message - Client-safe error message
   * @returns The response envelope with data null
   */
  private buildEnvelope(statusCode: number, message: string): ApiResponseData<null> {
    return {
      data: null,
      status: 'error',
      status_code: statusCode,
      message,
      error: message,
    };
  }

  /**
   * Pulls a readable message out of a Nest HttpException
   * @param exception - The exception raised by Nest
   * @returns A flat message string, joining validation errors when present
   */
  private extractHttpMessage(exception: HttpException): string {
    const payload = exception.getResponse();

    if (typeof payload === 'string') return payload;

    const message = (payload as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message.join(', ');

    return message ?? exception.message;
  }
}
