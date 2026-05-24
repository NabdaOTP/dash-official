// ─────────────────────────────────────────────────────────────
// File: src/features/send-otp/types.ts
// ─────────────────────────────────────────────────────────────

/**
 * Request body for POST /external/waba/{phoneNumberId}/otp/send
 */
export interface SendOtpRequest {
    to: string;                       // recipient phone, E.164 format ("201000000000")
    purpose: string;                  // e.g. "login", "signup", "reset"
    ttlSeconds: number;               // how long the code is valid
    templateName: string;             // approved Meta template name
}

/**
 * Response shape (unconfirmed — backend not testable yet without
 * a real WhatsApp connection. Adjust once verified.)
 */
export interface SendOtpResponse {
    success?: boolean;
    messageId?: string;
    to?: string;
    sentAt?: string;
    // Some implementations return the code in dev mode
    code?: string;
    [key: string]: unknown;
}

/**
 * Request body for POST /external/waba/otp/verify
 */
export interface VerifyOtpRequest {
    to: string;
    code: string;
    purpose: string;
}

export interface VerifyOtpResponse {
    success?: boolean;
    verified?: boolean;
    message?: string;
    [key: string]: unknown;
}

/**
 * Local state representing a successful send attempt,
 * used to render the result card and enable verification.
 */
export interface SendResult {
    phoneNumber: string;
    purpose: string;
    templateName: string;
    sentAt: Date;
    messageId?: string;
    // If the backend returns the code (dev mode), we can show it
    code?: string;
}