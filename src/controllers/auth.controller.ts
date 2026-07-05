import type { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { sendSuccess } from '@/utils/ApiResponse';
import { UnauthorizedError } from '@/utils/AppError';
import { MESSAGES } from '@/constants/messages';
import {
  REFRESH_COOKIE_NAME,
  clearRefreshCookieOptions,
  refreshCookieOptions,
} from '@/utils/cookie';

class AuthController {

  googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body as { idToken: string };
    const { user, tokens } = await authService.loginWithGoogle(idToken);

    res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, refreshCookieOptions);
    sendSuccess(res, {
      message: 'Logged in successfully',
      data: { user, accessToken: tokens.accessToken },
    });
    
  });

 
  refresh = asyncHandler(async (req: Request, res: Response) => {
    const token =
      (req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined) ??
      (req.body?.refreshToken as string | undefined);
    if (!token) throw new UnauthorizedError('Refresh token missing');

    const { user, tokens } = await authService.refresh(token);

    res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, refreshCookieOptions);
    sendSuccess(res, {
      message: 'Token refreshed successfully',
      data: { user, accessToken: tokens.accessToken },
    });
  });


  logout = asyncHandler(async (req: Request, res: Response) => {
    if (req.user) await authService.logout(req.user.id);
    res.clearCookie(REFRESH_COOKIE_NAME, clearRefreshCookieOptions);
    sendSuccess(res, { message: 'Logged out successfully' });
  });


  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.findById(req.user!.id);
    sendSuccess(res, { message: MESSAGES.FETCHED, data: { user } });
  });
}

export const authController = new AuthController();