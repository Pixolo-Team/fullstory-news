/**
 * Base class for every error a service is allowed to throw.
 *
 * Services must never throw HttpException - that would put HTTP concerns in the
 * business layer. They throw a DomainError, and DomainExceptionFilter maps it to
 * a status code and the response envelope.
 */
export abstract class DomainError extends Error {
  /** HTTP status the global filter maps this error to. */
  public abstract readonly statusCode: number;

  /** Stable machine-readable code, useful to clients and to logs. */
  public abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, new.target);
  }
}

/** A requested resource does not exist. */
export class NotFoundError extends DomainError {
  public readonly statusCode = 404;
  public readonly code = 'NOT_FOUND';

  /**
   * Creates a not-found error for a named resource
   * @param resource - Human readable resource name, e.g. "Article"
   * @param identifier - The id or slug that was looked up
   */
  constructor(resource: string, identifier: string) {
    super(`${resource} not found: ${identifier}`);
  }
}

/** The request is understood but breaks a business rule. */
export class ValidationError extends DomainError {
  public readonly statusCode = 422;
  public readonly code = 'VALIDATION_FAILED';
}

/** The write conflicts with existing data, e.g. a duplicate slug. */
export class ConflictError extends DomainError {
  public readonly statusCode = 409;
  public readonly code = 'CONFLICT';
}

/** The caller is not authenticated. */
export class UnauthorizedError extends DomainError {
  public readonly statusCode = 401;
  public readonly code = 'UNAUTHORIZED';
}

/** The caller is authenticated but not allowed to do this. */
export class ForbiddenError extends DomainError {
  public readonly statusCode = 403;
  public readonly code = 'FORBIDDEN';
}

/**
 * A dependency this service relies on failed - Supabase, storage, network.
 * Never carries the upstream error text to the client.
 */
export class DependencyError extends DomainError {
  public readonly statusCode = 503;
  public readonly code = 'DEPENDENCY_UNAVAILABLE';
}
