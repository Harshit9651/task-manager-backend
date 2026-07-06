import { createHash } from 'node:crypto';
import { BaseService } from '@/services/base.service';
import { UserModel, type IUserDocument } from '@/models/user.model';
import { ForbiddenError } from '@/utils/AppError';
import type { DecodedFirebaseUser } from '@/interfaces/auth.interface';

const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

class UserService extends BaseService<IUserDocument> {
  constructor() {
    super(UserModel, 'User');
  }

  findByFirebaseUid(firebaseUid: string) {
    return UserModel.findOne({ firebaseUid });
  }

  async upsertFromFirebase(profile: DecodedFirebaseUser): Promise<IUserDocument> {

    const existing = await UserModel.findOneWithDeleted({ firebaseUid: profile.uid });
    if (existing && (existing.isDeleted || !existing.isActive)) {
      throw new ForbiddenError('This account has been deactivated');
    }
const isNewUser = !existing;
    const user = await UserModel.findOneAndUpdate(
      { firebaseUid: profile.uid },
      {
        email: profile.email,
        name: profile.name,
        photoURL: profile.picture,
        emailVerified: profile.emailVerified,
        provider: 'google',
        lastLoginAt: new Date(),
      },
      { new: true, upsert: true, runValidators: true },
    );
try {
    if (isNewUser && user) {
        const { sendWelcomeEmail } = await import("@/services/welcome.service");

        void sendWelcomeEmail({
            id: user.id,
            email: user.email,
            name: user.name,
        });
    }
} catch (err) {
    console.error("Failed to send welcome email:", err);
}

    return user as IUserDocument;
  }

  async setRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { refreshTokenHash: hashToken(refreshToken) });
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { refreshTokenHash: null });
  }

  async isRefreshTokenValid(userId: string, refreshToken: string): Promise<boolean> {
    const user = await UserModel.findById(userId).select('+refreshTokenHash');
    if (!user?.refreshTokenHash) return false;
    return user.refreshTokenHash === hashToken(refreshToken);
  }
}

export const userService = new UserService();