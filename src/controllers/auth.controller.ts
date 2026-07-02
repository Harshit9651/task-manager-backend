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

  // googleLogin = asyncHandler(async (req: Request, res: Response) => {
  //   const { idToken } = req.body as { idToken: string };
  //   const { user, tokens } = await authService.loginWithGoogle(idToken);

  //   res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, refreshCookieOptions);
  //   sendSuccess(res, {
  //     message: 'Logged in successfully',
  //     data: { user, accessToken: tokens.accessToken },
  //   });
    
  // });
googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body as { idToken: string };

  console.log("\n========== GOOGLE LOGIN ==========");
  console.log("Firebase ID Token:");
  console.log(idToken);

  const { user, tokens } = await authService.loginWithGoogle(idToken);

  console.log("\n========== USER ==========");
  console.dir(user, { depth: null });

  console.log("\n========== TOKENS ==========");
  console.log("Access Token:");
  console.log(tokens.accessToken);

  console.log("\nRefresh Token:");
  console.log(tokens.refreshToken);

  res.cookie(
    REFRESH_COOKIE_NAME,
    tokens.refreshToken,
    refreshCookieOptions
  );

  console.log("\n========== COOKIE ==========");
  console.dir({
    cookieName: REFRESH_COOKIE_NAME,
    cookieValue: tokens.refreshToken,
    cookieOptions: refreshCookieOptions,
  }, { depth: null });

  sendSuccess(res, {
    message: "Logged in successfully",
    data: {
      user,
      accessToken: tokens.accessToken,
    },
  });

  console.log("\n========== RESPONSE SENT ==========\n");
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