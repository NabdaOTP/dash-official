import { api } from "@/lib/api-client";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  User,
  Session,
  UpdateProfileRequest,
} from "../types";

// Auth

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return api.post<RegisterResponse>("/auth/register", data, false);
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>("/auth/login", data, false);
}

export async function verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  return api.post<VerifyOtpResponse>("/auth/verify-otp", data, false);
}

export async function requestPasswordReset(data: PasswordResetRequest): Promise<void> {
  return api.post<void>("/auth/password-reset/request", data, false);
}

export async function resetPassword(data: PasswordResetConfirm): Promise<void> {
  return api.post<void>("/auth/password-reset/reset", data, false);
}

export async function refreshToken(refreshTokenStr: string) {
  return api.post<{ accessToken: string; refreshToken: string }>(
    "/auth/refresh",
    { refreshToken: refreshTokenStr },
    false
  );
}

export async function logout(refreshTokenStr: string): Promise<void> {
  return api.post<void>("/auth/logout", { refreshToken: refreshTokenStr });
}

// 2FA

export async function enable2FA(): Promise<void> {
  return api.post<void>("/auth/2fa/enable");
}

export async function confirm2FA(code: string): Promise<void> {
  return api.post<void>("/auth/2fa/confirm", { code });
}

export async function disable2FA(code: string): Promise<void> {
  return api.post<void>("/auth/2fa/disable", { code });
}

// Sessions 

export async function getSessions(): Promise<Session[]> {
  return api.get<Session[]>("/auth/sessions");
}

export async function revokeAllSessions(): Promise<void> {
  return api.delete<void>("/auth/sessions");
}

export async function revokeSession(jti: string): Promise<void> {
  return api.delete<void>(`/auth/sessions/${jti}`);
}

// User Profile 

export async function getProfile(): Promise<User> {
  return api.get<User>("/users/profile");
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  return api.patch<User>("/users/profile", data);
}