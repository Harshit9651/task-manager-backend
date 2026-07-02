import type { AuthUser } from '@/types/common.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};