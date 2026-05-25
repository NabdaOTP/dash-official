// -------------------------------------------------------------
// File: src/features/send-otp/services/otp-service.ts
//
// IMPORTANT: These endpoints use API Key auth, NOT user JWT.
// They bypass the regular api-client and call the backend directly
// with an Authorization: Bearer <apiKey> header (or x-api-key,
// depending on what the backend expects).
//
// This is sandbox-mode only - for production, the user should call
// these endpoints from their own backend, never from the browser.
// -------------------------------------------------------------

import type {
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from "../types";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://connect.nabdaotp.com/api/v1";

interface ApiError extends Error {
    statusCode?: number;
    payload?: unknown;
}

interface CallWithApiKeyOptions {
    method?: "GET" | "POST";
    body?: unknown;
}

async function callWithApiKey<T>(
    path: string,
    apiKey: string,
    options?: CallWithApiKeyOptions
): Promise<T> {
    const method = options?.method ?? "POST";

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            // Most platforms accept either header - backend should support one.
            Authorization: `Bearer ${apiKey}`,
            "x-api-key": apiKey,
        },
        body:
            options?.body !== undefined
                ? JSON.stringify(options.body)
                : undefined,
    });

    let payload: unknown = null;
    try {
        payload = await res.json();
    } catch {
        // ignore body parse errors
    }

    if (!res.ok) {
        const err: ApiError = new Error(
            (payload as { message?: string })?.message ||
            `Request failed with status ${res.status}`
        );
        err.statusCode = res.status;
        err.payload = payload;
        throw err;
    }

    // Backend wraps responses as { data, success, ... } - unwrap if present
    if (payload && typeof payload === "object" && "data" in payload) {
        return (payload as { data: T }).data;
    }
    return payload as T;
}

/**
 * Send an OTP via WhatsApp using a Phone Number ID and an API Key.
 * POST /external/waba/{phoneNumberId}/otp/send
 */
export async function sendOtp(
    phoneNumberId: string,
    apiKey: string,
    data: SendOtpRequest
): Promise<SendOtpResponse> {
    return callWithApiKey<SendOtpResponse>(
        `/external/waba/${phoneNumberId}/otp/send`,
        apiKey,
        { body: data }
    );
}

/**
 * Verify an OTP code.
 * POST /external/waba/otp/verify
 */
export async function verifyOtp(
    apiKey: string,
    data: VerifyOtpRequest
): Promise<VerifyOtpResponse> {
    return callWithApiKey<VerifyOtpResponse>(
        `/external/waba/otp/verify`,
        apiKey,
        { body: data }
    );
}

interface AvailableTemplateItem {
    name: string;
    templateType?: string;
    category?: string;
}

interface AvailableTemplatesResponse {
    defaults?: AvailableTemplateItem[];
    projectTemplates?: AvailableTemplateItem[];
    recommendedOtpTemplateNames?: string[];
}

function isAuthTemplate(template: AvailableTemplateItem): boolean {
    const type = template.templateType?.toUpperCase();
    const category = template.category?.toUpperCase();
    return type === "AUTH" || category === "AUTHENTICATION";
}

/**
 * Returns OTP template names available for this API key/project.
 * GET /external/waba/templates/available
 */
export async function getAvailableOtpTemplateNames(
    apiKey: string
): Promise<string[]> {
    const data = await callWithApiKey<AvailableTemplatesResponse>(
        "/external/waba/templates/available",
        apiKey,
        { method: "GET" }
    );

    const recommended = Array.isArray(data.recommendedOtpTemplateNames)
        ? data.recommendedOtpTemplateNames
        : [];

    const authDefaults = Array.isArray(data.defaults)
        ? data.defaults.filter(isAuthTemplate).map((t) => t.name)
        : [];

    const authProjectTemplates = Array.isArray(data.projectTemplates)
        ? data.projectTemplates.filter(isAuthTemplate).map((t) => t.name)
        : [];

    const preferredNames = Array.from(
        new Set(
            [...recommended, ...authDefaults, ...authProjectTemplates]
                .map((name) => name?.trim())
                .filter((name): name is string => Boolean(name))
        )
    );

    if (preferredNames.length > 0) return preferredNames;

    // Fallback: expose any template names if auth-scoped names are empty.
    return Array.from(
        new Set(
            [...(data.defaults ?? []), ...(data.projectTemplates ?? [])]
                .map((template) => template.name?.trim())
                .filter((name): name is string => Boolean(name))
        )
    );
}
