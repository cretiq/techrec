/**
 * Structured error classes for authentication and session management
 * Following established error handling patterns from the codebase
 */

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public meta: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class SessionValidationError extends AuthError {
  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(message, 'SESSION_VALIDATION_ERROR', meta);
    this.name = 'SessionValidationError';
  }
}

export class CacheOperationError extends AuthError {
  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(message, 'CACHE_OPERATION_ERROR', meta);
    this.name = 'CacheOperationError';
  }
}

export class UnauthorizedAccessError extends AuthError {
  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(message, 'UNAUTHORIZED_ACCESS', meta);
    this.name = 'UnauthorizedAccessError';
  }
}