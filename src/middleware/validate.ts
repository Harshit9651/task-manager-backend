import type { Request, Response, NextFunction } from 'express';
import { validationResult, type ValidationChain } from 'express-validator';
import { ValidationError } from '@/utils/AppError';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await Promise.all(validations.map((validation) => validation.run(req)));

      const result = validationResult(req);
      if (result.isEmpty()) {
        next();
        return;
      }

      const formatted = result.array().map((err) => ({
        field: err.type === 'field' ? err.path : err.type,
        message: err.msg,
      }));

      next(new ValidationError('Validation failed', formatted));
    } catch (err) {
      next(err);
    }
  };
};