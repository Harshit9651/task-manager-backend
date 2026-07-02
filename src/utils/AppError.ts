import { HttpStatus } from '@/constants/httpStatus';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: 'fail' | 'error';
  public readonly isOperational: boolean;
  public readonly errors?: unknown;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    errors?: unknown,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', errors?: unknown) {
    super(message, HttpStatus.CONFLICT, errors);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors?: unknown) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, errors);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}