// nabda-offical

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { setTokens, clearTokens, tryRefreshToken } from "@/lib/api-client";
import { getProfile } from "../services/auth-service";
import type { User } from "../types";

// ── Context shape ──

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.includes(route)
  );

  // ── Fetch user profile on mount, with refresh fallback ──
  const fetchUser = useCallback(async () => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const accessToken = localStorage.getItem("nabda-official-token");
    const refreshToken = localStorage.getItem("nabda-official-refresh-token");

    // No tokens at all → user is logged out
    if (!accessToken && !refreshToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Try fetching the profile with whatever token we have
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch {
      // Profile fetch failed — could be expired access token.
      // The api-client already auto-retries with refresh, so if we got here,
      // refresh either failed or refresh token is also gone.

      // Last-ditch effort: try refresh manually if we still have a refresh token
      if (refreshToken) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          try {
            const profile = await getProfile();
            setUser(profile);
            setLoading(false);
            return;
          } catch {
            // even after refresh, profile fetch failed — give up
          }
        }
      }

      setUser(null);
      clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
    await fetchUser();
  })()}, [fetchUser]);

  // ── Redirect logic ──
  useEffect(() => {
    if (loading) return;

    // Not logged in and trying to access protected route → login
    if (!user && !isPublicRoute) {
      router.replace(`/${locale}/login`);
    }

    // Already logged in and trying to access auth page → projects
    if (user && isPublicRoute) {
      router.replace(`/${locale}/projects`);
    }
  }, [user, loading, isPublicRoute, router, locale]);

  // ── After login — store tokens and fetch user ──
  const loginWithTokens = useCallback(
    async (accessToken: string, refreshToken: string) => {
      setTokens(accessToken, refreshToken);
      try {
        const profile = await getProfile();
        setUser(profile);
        router.push(`/${locale}/projects`);
      } catch {
        clearTokens();
        setUser(null);
      }
    },
    [router, locale]
  );

  // ── Logout ──
  const handleLogout = useCallback(() => {
    const refreshToken = localStorage.getItem("nabda-official-refresh-token");
    if (refreshToken) {
      // Fire-and-forget logout API call
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "https://connect.nabdaotp.com/api/v1"}/auth/logout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        }
      ).catch(() => {});
    }
    clearTokens();
    setUser(null);
    router.push(`/${locale}/login`);
  }, [router, locale]);

  // ── Refresh user data ──
  const refreshUser = useCallback(async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch {
      // silent fail
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        loginWithTokens,
        logout: handleLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}