import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { verifyAccessToken } from '@/utils/jwt';
import { userService } from '@/services/user.service';
import { ForbiddenError, UnauthorizedError } from '@/utils/AppError';
import type { UserRole } from '@/constants/roles';

const extractToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  const cookieToken = req.cookies?.accessToken as string | undefined;
  return cookieToken ?? null;
};


export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) throw new UnauthorizedError('Authentication required');

    const payload = verifyAccessToken(token);

    const user = await userService.findOne({ _id: payload.sub });
    if (!user) throw new UnauthorizedError('User no longer exists');
    if (!user.isActive) throw new ForbiddenError('This account has been deactivated');

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firebaseUid: user.firebaseUid,
    };
    next();
  },
);


export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new UnauthorizedError('Authentication required'));
    if (roles.length > 0 && !roles.includes(req.user.role as UserRole)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }
    next();
  };
};