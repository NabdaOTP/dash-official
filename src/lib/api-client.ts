const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://connect.nabdaotp.com/api-docs";

// ── Token lifetimes ──
// Access token cookie: 30 days (backend access token itself may expire sooner;
//                                refresh will kick in automatically)
// Refresh token: stored in localStorage indefinitely (cleared on logout)
const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// ── Token helpers ──

function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("nabda-official-token");
}

function getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("nabda-official-refresh-token");
}

export function setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem("nabda-official-token", accessToken);
    localStorage.setItem("nabda-official-refresh-token", refreshToken);

    // Cookie used by middleware for route protection (httpOnly not possible client-side)
    document.cookie = `nabda-official-token=${accessToken}; path=/; max-age=${ACCESS_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearTokens() {
    localStorage.removeItem("nabda-official-token");
    localStorage.removeItem("nabda-official-refresh-token");
    document.cookie =
        "nabda-official-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

// ── API Error ──

export class ApiError extends Error {
    statusCode: number;
    errors: unknown;

    constructor(statusCode: number, message: string, errors?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

// ── Refresh logic (single-flight) ──

let refreshPromise: Promise<boolean> | null = null;

export async function tryRefreshToken(): Promise<boolean> {
    // Deduplicate concurrent refresh calls — multiple 401s should trigger ONE refresh
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) return false;

        try {
            const res = await fetch(`${BASE_URL}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });

            if (!res.ok) {
                clearTokens();
                return false;
            }

            const json = await res.json();
            const data = json.data ?? json;

            if (data.accessToken && data.refreshToken) {
                setTokens(data.accessToken, data.refreshToken);
                return true;
            }

            // Some backends rotate only the access token
            if (data.accessToken && !data.refreshToken) {
                setTokens(data.accessToken, refreshToken);
                return true;
            }

            clearTokens();
            return false;
        } catch {
            clearTokens();
            return false;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

// ── Core request function ──

interface RequestOptions {
    method: string;
    path: string;
    body?: unknown;
    auth?: boolean;
}

async function request<T>({
    method,
    path,
    body,
    auth = true,
}: RequestOptions): Promise<T> {
    const url = `${BASE_URL}${path}`;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (auth) {
        const token = getAccessToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    const res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // If 401, try refresh once then retry
    if (res.status === 401 && auth) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
            const newToken = getAccessToken();
            if (newToken) {
                headers["Authorization"] = `Bearer ${newToken}`;
            }

            const retryRes = await fetch(url, {
                method,
                headers,
                body: body !== undefined ? JSON.stringify(body) : undefined,
            });

            return handleResponse<T>(retryRes);
        }

        // Refresh failed — only redirect if we're in the browser AND not on a public page
        if (typeof window !== "undefined") {
            clearTokens();
            const path = window.location.pathname;
            const isPublicPath =
                path.includes("/login") ||
                path.includes("/signup") ||
                path.includes("/forgot-password") ||
                path.includes("/reset-password") ||
                path.includes("/verify-otp");

            if (!isPublicPath) {
                const locale = path.split("/")[1] || "en";
                window.location.href = `/${locale}/login`;
            }
        }
        throw new ApiError(401, "Session expired");
    }

    return handleResponse<T>(res);
}

async function handleResponse<T>(res: Response): Promise<T> {
    const json = await res.json();

    if (!res.ok || json.success === false) {
        throw new ApiError(
            json.statusCode ?? res.status,
            json.message ?? "Request failed",
            json.errors
        );
    }

    return (json.data !== undefined ? json.data : json) as T;
}

// ── Public API methods ──

export const api = {
    get<T>(path: string, auth = true): Promise<T> {
        return request<T>({ method: "GET", path, auth });
    },

    post<T>(path: string, body?: unknown, auth = true): Promise<T> {
        return request<T>({ method: "POST", path, body: body ?? {}, auth });
    },

    patch<T>(path: string, body?: unknown, auth = true): Promise<T> {
        return request<T>({ method: "PATCH", path, body: body ?? {}, auth });
    },

    delete<T>(path: string, auth = true): Promise<T> {
        return request<T>({ method: "DELETE", path, auth });
    },
};