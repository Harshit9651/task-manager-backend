
import type { Request, Response, NextFunction } from 'express';
import { config } from '@/config';
import { logger } from '@/utils/logger';

interface HttpError extends Error {
  statusCode?: number;
  status?: number;
  code?: number;
  errors?: unknown;
  keyValue?: Record<string, unknown>;
  path?: string;
}


export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = err.statusCode ?? err.status ?? 500;
  let message = err.message || 'Internal Server Error';
  let errors: unknown;


  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for "${err.path ?? 'field'}"`;
  }


  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = err.errors;
  }

 
  if (err.code === 11000) {
    statusCode = 409;
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    message = `Duplicate value for "${field}"`;
  }


  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  if (statusCode >= 500) {
    logger.error(`${statusCode} ${message}`, err.stack ?? '');
  } else {
    logger.warn(`${statusCode} ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
};