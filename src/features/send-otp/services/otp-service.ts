// ─────────────────────────────────────────────────────────────
// File: src/features/send-otp/services/otp-service.ts
//
// IMPORTANT: These endpoints use API Key auth, NOT user JWT.
// They bypass the regular api-client and call the backend directly
// with an Authorization: Bearer <apiKey> header (or x-api-key,
// depending on what the backend expects).
//
// This is sandbox-mode only — for production, the user should call
// these endpoints from their own backend, never from the browser.
// ─────────────────────────────────────────────────────────────

import type {
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from "../types";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://connect.nabdaotp.com/api-docs";

interface ApiError extends Error {
    statusCode?: number;
    payload?: unknown;
}

async function callWithApiKey<T>(
    path: string,
    apiKey: string,
    body: unknown
): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // Most platforms accept either header — backend should support one.
            Authorization: `Bearer ${apiKey}`,
            "x-api-key": apiKey,
        },
        body: JSON.stringify(body),
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

    // Backend wraps responses as { data, success, ... } — unwrap if present
    if (
        payload &&
        typeof payload === "object" &&
        "data" in payload
    ) {
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
        data
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
        data
    );
}