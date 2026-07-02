// src/models/user.model.ts
import { Schema, model, type Document } from 'mongoose';
import { baseSchemaOptions } from '@/database/schema.options';
import {
  softDeletePlugin,
  type SoftDeleteFields,
  type SoftDeleteMethods,
  type SoftDeleteModel,
} from '@/database/plugins/softDelete.plugin';
import { UserRole, USER_ROLES } from '@/constants/roles';

/** Plain data shape of a user. */
export interface IUser extends SoftDeleteFields {
  firebaseUid: string;
  email: string;
  name?: string;
  photoURL?: string;
  role: UserRole;
  provider: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date | null;
  refreshTokenHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Hydrated document (adds Mongoose Document + soft-delete instance methods). */
export interface IUserDocument extends IUser, Document, SoftDeleteMethods {}

const userSchema = new Schema<IUserDocument>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, trim: true },
    photoURL: { type: String, trim: true },
    role: { type: String, enum: USER_ROLES, default: UserRole.USER, index: true },
    provider: { type: String, default: 'google' },
    emailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date, default: null },
    // Hash of the current refresh token — never selected/returned by default.
    refreshTokenHash: { type: String, default: null, select: false },
  },
  baseSchemaOptions,
);

userSchema.plugin(softDeletePlugin);

// Defense-in-depth: strip sensitive fields from any JSON serialization.
userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.refreshTokenHash;
    return ret;
  },
});

export const UserModel = model<IUserDocument>('User', userSchema) as SoftDeleteModel<IUserDocument>;