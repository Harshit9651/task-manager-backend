import type { Response } from 'express';
import { HttpStatus } from '@/constants/httpStatus';
import type { PaginationMeta } from '@/types/common.types';

interface SuccessOptions<T> {
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
}

export const sendSuccess = <T>(res: Response, options: SuccessOptions<T> = {}): Response => {
  const { statusCode = HttpStatus.OK, message = 'Success', data, meta } = options;
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
    ...(meta ? { meta } : {}),
  });
};

export const sendCreated = <T>(res: Response, data: T, message = 'Created successfully'): Response =>
  sendSuccess(res, { statusCode: HttpStatus.CREATED, message, data });

export const sendPaginated = <T>(
  res: Response,
  results: T[],
  meta: PaginationMeta,
  message = 'Fetched successfully',
): Response => sendSuccess(res, { statusCode: HttpStatus.OK, message, data: results, meta });

export const sendNoContent = (res: Response): Response => res.status(HttpStatus.NO_CONTENT).send();