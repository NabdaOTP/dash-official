// ─────────────────────────────────────────────────────────────
// File: src/features/waba/lib/oauth-popup.ts
//
// WHY THIS IS DIFFERENT FROM THE PREVIOUS VERSION:
//
// Modern browsers (Chrome 88+, Safari) enforce strict Cross-Origin-Opener-
// Policy (COOP) that breaks `window.opener` when a popup navigates through
// multiple cross-origin URLs (Meta's OAuth flow does this 5-6 times).
//
// As a result:
//  - The backend's callback page CAN'T reach window.opener via postMessage
//  - It falls back to "tryCompleteWithoutOpener" which needs localStorage
//    data — but localStorage is per-origin, so connect.nabda-otp.com can't
//    read what app.nabda-otp.com stored
//
// SOLUTION: This module accepts an optional `onPoll` callback that the
// caller can provide. When the popup closes (or times out), we call
// onPoll() repeatedly to check if the connection succeeded on the backend.
// If onPoll returns true at any point, we treat the flow as successful.
// ─────────────────────────────────────────────────────────────

export interface PopupResult {
    completed: boolean;
    cancelled: boolean;
    error?: string;
    payload?: Record<string, unknown>;
}

export interface PopupOptions {
    /**
     * Called after the popup closes (or after detected success).
     * Should return true if the operation succeeded server-side.
     * Will be called repeatedly (up to ~30s) until it returns true
     * or we give up.
     *
     * This is the fallback for when postMessage can't reach us
     * due to Cross-Origin-Opener-Policy restrictions.
     */
    onPoll?: () => Promise<boolean>;
    /** How often to poll after popup closes (ms). Default: 2000 */
    pollIntervalMs?: number;
    /** How long to keep polling after popup closes (ms). Default: 30000 */
    pollTimeoutMs?: number;
}

const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 750;
const POLL_INTERVAL_MS = 500;
const MAX_TIME_MS = 10 * 60 * 1000;

const TRUSTED_DOMAIN_PATTERN = /(^|\.)nabda-otp\.com$/i;

export function openOAuthPopup(
    url: string,
    title = "OAuth",
    options: PopupOptions = {}
): Promise<PopupResult> {
    return new Promise((resolve) => {
        if (typeof window === "undefined") {
            resolve({ completed: false, cancelled: false, error: "No window available" });
            return;
        }

        const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2;
        const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2;
        const features = [
            `width=${POPUP_WIDTH}`,
            `height=${POPUP_HEIGHT}`,
            `left=${left}`,
            `top=${top}`,
            "menubar=no",
            "toolbar=no",
            "location=no",
            "status=no",
            "scrollbars=yes",
            "resizable=yes",
        ].join(",");

        const popup = window.open(url, title, features);
        if (!popup) {
            resolve({
                completed: false,
                cancelled: false,
                error: "Popup was blocked. Please allow popups and try again.",
            });
            return;
        }

        let detectedSuccess = false;
        let detectedPayload: Record<string, unknown> | undefined;
        let detectedError: string | undefined;
        let resolved = false;

        // ── BroadcastChannel listener (works only same-origin, kept for safety) ──
        let broadcastChannel: BroadcastChannel | null = null;
        try {
            broadcastChannel = new BroadcastChannel("NABDA_WABA_CONNECT");
        } catch {
            // Not supported
        }

        const cleanup = () => {
            window.clearInterval(checkInterval);
            window.removeEventListener("message", handleMessage);
            if (broadcastChannel) broadcastChannel.close();
        };

        const finish = (result: PopupResult) => {
            if (resolved) return;
            resolved = true;
            cleanup();
            try {
                if (!popup.closed) popup.close();
            } catch {
                // ignore
            }
            resolve(result);
        };

        /**
         * Run the onPoll callback repeatedly until it succeeds or times out.
         * Called when the popup closes without a confirmed success signal.
         */
        const runPollFallback = async (): Promise<boolean> => {
            if (!options.onPoll) return false;

            const interval = options.pollIntervalMs ?? 2000;
            const timeout = options.pollTimeoutMs ?? 30000;
            const deadline = Date.now() + timeout;

            while (Date.now() < deadline) {
                try {
                    const ok = await options.onPoll();
                    if (ok) return true;
                } catch {
                    // Keep trying — transient errors are OK
                }
                await new Promise((r) => window.setTimeout(r, interval));
            }
            return false;
        };

        // ── PostMessage listener (works if COOP doesn't break opener) ──
        const handleMessage = (event: MessageEvent) => {
            let originHost: string;
            try {
                originHost = new URL(event.origin).hostname;
            } catch {
                return;
            }

            const isTrusted =
                event.origin === window.location.origin ||
                TRUSTED_DOMAIN_PATTERN.test(originHost);
            if (!isTrusted) return;

            let data = event.data;
            if (typeof data === "string") {
                try {
                    data = JSON.parse(data);
                } catch {
                    return;
                }
            }
            if (!data || typeof data !== "object") return;

            // Nabda backend callback format
            if (data.type === "NABDA_WABA_CALLBACK") {
                const payload = (data.payload || {}) as Record<string, unknown>;

                if (payload.connected === true || payload.account) {
                    detectedSuccess = true;
                    detectedPayload = payload;
                    finish({ completed: true, cancelled: false, payload });
                    return;
                }

                if (payload.requiresCompletion === true) {
                    // Mark and wait — popup will close, then we'll poll
                    detectedPayload = payload;
                    return;
                }

                detectedSuccess = true;
                detectedPayload = payload;
                finish({ completed: true, cancelled: false, payload });
                return;
            }

            // Legacy types
            const messageStr =
                typeof data === "string" ? data : (data.type ?? data.event ?? "");
            if (
                messageStr === "waba-connected" ||
                messageStr === "NABDA_WABA_CONNECTED" ||
                messageStr === "oauth-success"
            ) {
                detectedSuccess = true;
                finish({ completed: true, cancelled: false });
            }
        };

        window.addEventListener("message", handleMessage);

        if (broadcastChannel) {
            broadcastChannel.addEventListener("message", (event) => {
                const payload = event?.data;
                if (
                    payload &&
                    typeof payload === "object" &&
                    payload.type === "NABDA_WABA_CONNECTED"
                ) {
                    detectedSuccess = true;
                    detectedPayload = payload.payload as Record<string, unknown>;
                    finish({ completed: true, cancelled: false, payload: detectedPayload });
                }
            });
        }

        // ── Polling fallback when popup closes ─────────────────────────
        const startTime = Date.now();
        const checkInterval = window.setInterval(async () => {
            try {
                if (popup.closed) {
                    // Popup closed — check if we already detected success
                    if (detectedSuccess) {
                        finish({
                            completed: true,
                            cancelled: false,
                            payload: detectedPayload,
                        });
                        return;
                    }

                    // No success signal received. Try the poll fallback —
                    // ask the dashboard if the connection appeared on the backend
                    window.clearInterval(checkInterval);
                    window.removeEventListener("message", handleMessage);
                    if (broadcastChannel) broadcastChannel.close();

                    const pollSucceeded = await runPollFallback();

                    if (pollSucceeded) {
                        resolve({
                            completed: true,
                            cancelled: false,
                            payload: detectedPayload,
                        });
                    } else {
                        resolve({
                            completed: false,
                            cancelled: true,
                            error: detectedError,
                            payload: detectedPayload,
                        });
                    }
                    resolved = true;
                    return;
                }

                if (Date.now() - startTime > MAX_TIME_MS) {
                    finish({
                        completed: false,
                        cancelled: false,
                        error: "Connection timed out. Please try again.",
                    });
                    return;
                }

                // Try reading popup URL
                try {
                    const popupUrl = popup.location.href;
                    if (!popupUrl || popupUrl === "about:blank") return;

                    let popupHost: string;
                    try {
                        popupHost = new URL(popupUrl).hostname;
                    } catch {
                        return;
                    }

                    const isNabdaDomain =
                        popupUrl.startsWith(window.location.origin) ||
                        TRUSTED_DOMAIN_PATTERN.test(popupHost);

                    if (isNabdaDomain) {
                        try {
                            const params = new URL(popupUrl).searchParams;
                            const err = params.get("error") || params.get("error_description");
                            if (err) {
                                finish({
                                    completed: false,
                                    cancelled: false,
                                    error: decodeURIComponent(err),
                                });
                                return;
                            }
                        } catch {
                            // ignore
                        }
                        // We're on a Nabda URL → the backend's callback ran
                        // Set flag so if popup closes, we treat as success
                        detectedSuccess = true;
                    }
                } catch {
                    // Cross-origin — keep polling
                }
            } catch (err) {
                finish({
                    completed: false,
                    cancelled: false,
                    error: err instanceof Error ? err.message : "Unknown error",
                });
            }
        }, POLL_INTERVAL_MS);
    });
}