import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
    getWabaConnectUrl,
    getWabaStatus,
    completeWabaConnect,
} from "@/features/waba/services/waba-service";
import {
    loadFacebookSdk,
    fbLogin,
} from "@/features/waba/lib/facebook-sdk";

interface UseWabaConnectOptions {
    projectId: string;
    onSuccess?: () => void;
}

export function useWabaConnect({ projectId, onSuccess }: UseWabaConnectOptions) {
    const [isConnecting, setIsConnecting] = useState(false);

    const signupSessionRef = useRef<{
        wabaId?: string;
        phoneNumberId?: string;
    }>({});
    const connectingRef = useRef(false);


    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            let isFacebook = false;
            try {
                const host = new URL(event.origin).hostname;
                isFacebook =
                    host === "facebook.com" || host.endsWith(".facebook.com");
            } catch {
                return;
            }
            if (!isFacebook) return;

            let payload: unknown = event.data;
            if (typeof payload === "string") {
                try {
                    payload = JSON.parse(payload);
                } catch {
                    return;
                }
            }
            if (!payload || typeof payload !== "object") return;

            const obj = payload as Record<string, unknown>;
            if (obj.type !== "WA_EMBEDDED_SIGNUP") return;

            console.log("[WABA] Embedded signup event:", obj);

            const data = (obj.data || {}) as Record<string, unknown>;
            const wabaId =
                (data.waba_id as string | undefined) ||
                (data.wabaId as string | undefined);
            const phoneNumberId =
                (data.phone_number_id as string | undefined) ||
                (data.phoneNumberId as string | undefined);

            if (wabaId || phoneNumberId) {
                signupSessionRef.current = {
                    wabaId: wabaId || signupSessionRef.current.wabaId,
                    phoneNumberId:
                        phoneNumberId || signupSessionRef.current.phoneNumberId,
                };
                console.log(
                    "[WABA] Captured session data:",
                    signupSessionRef.current
                );
            }
        };

        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    const connect = useCallback(async () => {
        if (connectingRef.current) return;
        connectingRef.current = true;
        setIsConnecting(true);
        signupSessionRef.current = {};

        try {
            // 1. Fetch connect config
            const connectData = await getWabaConnectUrl(projectId);
            console.log("[WABA] Connect data:", connectData);

            if (!connectData.embeddedSignup?.configId) {
                throw new Error(
                    "Embedded signup is not configured on the backend."
                );
            }

            // 2. Get baseline account count for polling fallback
            let baselineCount = 0;
            try {
                const before = await getWabaStatus(projectId);
                baselineCount = before.accounts.length;
            } catch {
                // Ignore
            }

            // 3. Load FB SDK and trigger login
            await loadFacebookSdk(
                connectData.embeddedSignup.appId,
                connectData.embeddedSignup.version
            );

            const loginResult = await fbLogin(
                connectData.embeddedSignup.configId,
                {
                    redirectUri: connectData.redirectUri,
                    fallbackRedirectUri: connectData.fallbackRedirectUri,
                    extras: connectData.embeddedSignup.extras,
                    state: connectData.state,
                }
            );

            console.log("[WABA] FB.login result:", loginResult);

            if (!loginResult) {
                connectingRef.current = false;
                setIsConnecting(false);
                return;
            }

            // 4. Brief wait in case Meta events arrive within 3s
            await new Promise<void>((resolve) => {
                let elapsed = 0;
                const interval = window.setInterval(() => {
                    elapsed += 200;
                    if (
                        signupSessionRef.current.wabaId &&
                        signupSessionRef.current.phoneNumberId
                    ) {
                        window.clearInterval(interval);
                        resolve();
                    } else if (elapsed >= 3000) {
                        window.clearInterval(interval);
                        resolve();
                    }
                }, 200);
            });

            console.log(
                "[WABA] Session data after wait:",
                signupSessionRef.current
            );

            // 5. PATH A: We have wabaId + phoneNumberId from Meta events
            //    → call complete-auto with full data
            if (
                signupSessionRef.current.wabaId &&
                signupSessionRef.current.phoneNumberId
            ) {
                console.log("[WABA] Path A: complete-auto with full data");
                try {
                    const account = await completeWabaConnect({
                        code: loginResult.code,
                        state: loginResult.state || connectData.state,
                        projectId,
                        wabaId: signupSessionRef.current.wabaId,
                        phoneNumberId: signupSessionRef.current.phoneNumberId,
                        redirectUri: connectData.redirectUri,
                        fallbackRedirectUri: connectData.fallbackRedirectUri,
                    });
                    toast.success(
                        account.name
                            ? `${account.name} connected successfully`
                            : "WhatsApp connected successfully"
                    );
                    onSuccess?.();
                    return;
                } catch (err) {
                    console.error("[WABA] Path A failed:", err);
                    // Fall through to polling
                }
            }

            // 6. PATH B: No Meta events received. The backend's GET /callback
            //    endpoint may have already auto-connected the account during
            //    the OAuth redirect (it has the code in the URL and can
            //    process it server-side).
            //    Poll /waba/status to see if a new account appeared.
            console.log("[WABA]: polling for backend auto-completion…");
            toast.info("Finalizing connection…", { duration: 25000 });

            const checkStatus = async (): Promise<boolean> => {
                try {
                    const status = await getWabaStatus(projectId);
                    return status.accounts.length > baselineCount;
                } catch {
                    return false;
                }
            };

            // Poll every 2s for up to 30s
            let pollSucceeded = false;
            for (let i = 0; i < 15; i++) {
                await new Promise((r) => window.setTimeout(r, 2000));
                if (await checkStatus()) {
                    pollSucceeded = true;
                    break;
                }
            }

            if (pollSucceeded) {
                toast.dismiss();
                toast.success("WhatsApp connected successfully");
                onSuccess?.();
                return;
            }

            toast.dismiss();
            // throw new Error(
            //     "We couldn't detect a new WhatsApp account. The Meta dialog completed " +
            //     "but the connection wasn't finalized on our end. Please contact support " +
            //     "or try again."
            // );
            toast.info(
                "Your authorization was received. The account will appear here shortly — please refresh in a moment.",
                { duration: 8000 }
            );
        } catch (err) {
            console.error("[WABA] Connect failed:", err);
            const message =
                err instanceof Error ? err.message : "Failed to connect WhatsApp";
            toast.error(message);
        } finally {
            connectingRef.current = false;
            setIsConnecting(false);
        }
    }, [projectId, onSuccess]);

    return { connect, isConnecting };
}