// User 

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  twoFactorEnabled: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  referralCode: string | null;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

// Auth requests

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  referralCode?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// Auth responses

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  // If 2FA is enabled, the backend may return requiresOtp instead of tokens
  requires2fa?: boolean;
  email?: string;
  // If no 2FA, tokens are returned directly
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Sessions

export interface Session {
  id: string;
  jti: string;
  userId: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  lastUsedAt: string;
  expiresAt: string;
  refreshTokenHash?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Profile update

export interface UpdateProfileRequest {
  email?: string;
  name?: string;
  avatarUrl?: string;
}
