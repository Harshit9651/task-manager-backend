import { verifyFirebaseIdToken } from '@/services/firebaseAuth.service';
import { userService } from '@/services/user.service';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { ForbiddenError, UnauthorizedError } from '@/utils/AppError';
import type { AuthTokens, JwtPayload } from '@/interfaces/auth.interface';
import type { IUserDocument } from '@/models/user.model';

export interface AuthResult {
  user: IUserDocument;
  tokens: AuthTokens;
}

const buildPayload = (user: IUserDocument): JwtPayload => ({
  sub: user.id,
  email: user.email,
  role: user.role,
});

const issueTokens = async (user: IUserDocument): Promise<AuthTokens> => {
  const payload = buildPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await userService.setRefreshToken(user.id, refreshToken);
  return { accessToken, refreshToken };
};

class AuthService {

  async loginWithGoogle(idToken: string): Promise<AuthResult> {
    const profile = await verifyFirebaseIdToken(idToken);
    const user = await userService.upsertFromFirebase(profile);
    const tokens = await issueTokens(user);
    return { user, tokens };
  }


  async refresh(refreshToken: string): Promise<AuthResult> {
    const payload = verifyRefreshToken(refreshToken); 

    const stillValid = await userService.isRefreshTokenValid(payload.sub, refreshToken);
    if (!stillValid) throw new UnauthorizedError('Refresh token is no longer valid');

    const user = await userService.findOne({ _id: payload.sub });
    if (!user) throw new UnauthorizedError('User no longer exists');
    if (!user.isActive) throw new ForbiddenError('This account has been deactivated');

    const tokens = await issueTokens(user);
    return { user, tokens };
  }

  async logout(userId: string): Promise<void> {
    await userService.clearRefreshToken(userId);
  }
}

export const authService = new AuthService();