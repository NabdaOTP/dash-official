export interface PopupResult {
    completed: boolean;
    cancelled: boolean;
    error?: string;
}

const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 750;
const POLL_INTERVAL_MS = 500;
const MAX_TIME_MS = 10 * 60 * 1000; // 10-minute timeout

// Domains we trust as "the OAuth flow finished" signals.
// Any *.nabdaotp.com domain qualifies.
const TRUSTED_DOMAIN_PATTERN = /(^|\.)nabdaotp\.com$/i;

/**
 * Open the given URL in a centered popup and resolve when the flow ends.
 */
export function openOAuthPopup(
    url: string,
    title = "OAuth"
): Promise<PopupResult> {
    return new Promise((resolve) => {
        if (typeof window === "undefined") {
            resolve({
                completed: false,
                cancelled: false,
                error: "No window available",
            });
            return;
        }

        // Center popup on screen
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
                error:
                    "Popup was blocked. Please allow popups for this site and try again.",
            });
            return;
        }

        const startTime = Date.now();
        let detectedSuccess = false;
        let resolved = false;

        const cleanup = () => {
            window.clearInterval(checkInterval);
            window.removeEventListener("message", handleMessage);
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

        // PostMessage listener 
        // If the backend's callback page posts a message to the opener,
        // accept it as a completion signal (provided the origin is trusted).
        const handleMessage = (event: MessageEvent) => {
            let originHost: string;
            try {
                originHost = new URL(event.origin).hostname;
            } catch {
                return;
            }

            const isTrustedOrigin =
                event.origin === window.location.origin ||
                TRUSTED_DOMAIN_PATTERN.test(originHost);

            if (!isTrustedOrigin) return;

            // Accept any of these shapes:
            //   { type: "waba-connected" }
            //   { type: "waba-connect", status: "success" | "error" }
            //   "waba-connected" (raw string)
            const data = event.data;
            const messageStr =
                typeof data === "string"
                    ? data
                    : data?.type ?? data?.event ?? "";

            if (
                messageStr === "waba-connected" ||
                messageStr === "waba-connect" ||
                messageStr === "oauth-success"
            ) {
                const status = (data as { status?: string })?.status;
                if (status === "error") {
                    finish({
                        completed: false,
                        cancelled: false,
                        error: (data as { message?: string })?.message ?? "Connection failed",
                    });
                } else {
                    finish({ completed: true, cancelled: false });
                }
            }
        };

        window.addEventListener("message", handleMessage);

        // ── Poll the popup 
        const checkInterval = window.setInterval(() => {
            try {
                // Popup closed by user (or by us after success)
                if (popup.closed) {
                    finish({
                        completed: detectedSuccess,
                        cancelled: !detectedSuccess,
                    });
                    return;
                }

                // Timeout
                if (Date.now() - startTime > MAX_TIME_MS) {
                    finish({
                        completed: false,
                        cancelled: false,
                        error: "Connection timed out. Please try again.",
                    });
                    return;
                }

                // Try to read the popup's URL.
                // This will throw on cross-origin (e.g. facebook.com).
                try {
                    const popupUrl = popup.location.href;

                    if (!popupUrl || popupUrl === "about:blank") {
                        return; // not navigated yet
                    }

                    // Parse to get hostname
                    let popupHost: string;
                    try {
                        popupHost = new URL(popupUrl).hostname;
                    } catch {
                        return;
                    }

                    // Did we land on a Nabda-controlled domain?
                    const isNabdaDomain =
                        popupUrl.startsWith(window.location.origin) ||
                        TRUSTED_DOMAIN_PATTERN.test(popupHost);

                    if (isNabdaDomain) {
                        // Check query string for explicit error signal
                        try {
                            const params = new URL(popupUrl).searchParams;
                            const errParam = params.get("error") || params.get("error_description");
                            if (errParam) {
                                finish({
                                    completed: false,
                                    cancelled: false,
                                    error: decodeURIComponent(errParam),
                                });
                                return;
                            }
                        } catch {
                            // ignore
                        }

                        detectedSuccess = true;
                        // Close after a brief delay so the user sees any final page
                        window.setTimeout(() => {
                            try {
                                popup.close();
                            } catch {
                                // ignore
                            }
                        }, 800);
                    }
                } catch {
                    // Cross-origin (user is on facebook.com) — keep polling
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