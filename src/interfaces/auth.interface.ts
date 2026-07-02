import type { UserRole } from '@/constants/roles';


export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}


export interface DecodedFirebaseUser {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
  emailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}