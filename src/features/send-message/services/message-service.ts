import type { SendMessageRequest, SendMessageResponse } from "../types";

/**
 * Send a generic WhatsApp message using a template.
 * POST /api/v1/external/waba/{phoneNumberId}/messages
 *
 * Authentication: API key in Authorization header.
 * (Same pattern as our OTP send endpoint.)
 */
export async function sendMessage(
    phoneNumberId: string,
    apiKey: string,
    data: SendMessageRequest
): Promise<SendMessageResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    const url = `${baseUrl}/api/v1/external/waba/${phoneNumberId}/messages`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "x-api-key": apiKey, 
        },
        body: JSON.stringify(data),
    });

    // Parse the body (might be JSON wrapper or raw)
    let body: unknown = null;
    try {
        body = await response.json();
    } catch {
        // ignore parse error
    }

    if (!response.ok) {
        const msg =
            (body as { message?: string })?.message ||
            `Message send failed (${response.status})`;
        throw new Error(msg);
    }

    // Backend wraps responses in { data: ... } — unwrap if so
    const result =
        body && typeof body === "object" && "data" in body
            ? (body as { data: unknown }).data
            : body;

    return (result ?? {}) as SendMessageResponse;
}