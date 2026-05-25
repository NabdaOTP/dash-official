// ─────────────────────────────────────────────────────────────
// File: src/features/waba/hooks/use-waba-connect.ts
//
// Custom hook that manages the WhatsApp Embedded Signup flow using
// the official Facebook SDK (FB.login), matching what the backend
// test page does.
//
// This avoids ALL the popup/COOP issues because FB.login() opens
// its own modal that communicates directly via postMessage on the
// same origin.
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
    getWabaConnectUrl,
    completeWabaConnect,
} from "@/features/waba/services/waba-service";
import {
    loadFacebookSdk,
    fbLogin,
} from "@/features/waba/lib/facebook-sdk";

type EmbeddedSignupEvent = {
    type: "WA_EMBEDDED_SIGNUP";
    event: string;
    data?: {
        waba_id?: string;
        phone_number_id?: string;
        wabaId?: string;
        phoneNumberId?: string;
    };
};

interface UseWabaConnectOptions {
    projectId: string;
    onSuccess?: () => void;
}

export function useWabaConnect({ projectId, onSuccess }: UseWabaConnectOptions) {
    const [isConnecting, setIsConnecting] = useState(false);

    // Refs to hold state across async callbacks without re-renders
    const signupSessionRef = useRef<{
        wabaId?: string;
        phoneNumberId?: string;
    }>({});
    const connectingRef = useRef(false);

    // ── Listen for WA_EMBEDDED_SIGNUP events from Meta 
    // These come via postMessage from the FB SDK's iframe.
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Only accept messages from facebook.com domains
            console.log("[WABA] postMessage received:", event.origin, event.data);
            let isFacebook = false;
            try {
                const host = new URL(event.origin).hostname;
                isFacebook =
                    host === "facebook.com" || host.endsWith(".facebook.com");
            } catch {
                return;
            }
            if (!isFacebook) return;

            let payload = event.data;
            if (typeof payload === "string") {
                try {
                    payload = JSON.parse(payload);
                } catch {
                    return;
                }
            }
            if (
                !payload ||
                typeof payload !== "object" ||
                payload.type !== "WA_EMBEDDED_SIGNUP"
            ) {
                return;
            }

            const data = (payload as EmbeddedSignupEvent).data || {};
            const wabaId = data.waba_id || data.wabaId;
            const phoneNumberId = data.phone_number_id || data.phoneNumberId;

            if (wabaId || phoneNumberId) {
                signupSessionRef.current = {
                    wabaId: wabaId || signupSessionRef.current.wabaId,
                    phoneNumberId:
                        phoneNumberId || signupSessionRef.current.phoneNumberId,
                };
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
            // 1. Fetch the connect URL + embedded signup config
            const connectData = await getWabaConnectUrl(projectId);

            if (!connectData.embeddedSignup?.configId) {
                throw new Error(
                    "Embedded signup is not configured. Please contact support."
                );
            }

            // 2. Load and init the Facebook SDK
            await loadFacebookSdk(
                connectData.embeddedSignup.appId,
                connectData.embeddedSignup.version
            );

            // 3. Trigger FB.login() — this opens Meta's modal in-page
            //    (NOT a popup — no COOP issues)
            const loginResult = await fbLogin(
                connectData.embeddedSignup.configId,
                {
                    redirectUri: connectData.redirectUri,
                    fallbackRedirectUri: connectData.fallbackRedirectUri,
                    extras: connectData.embeddedSignup.extras,
                    state: connectData.state,
                }
            );

            // User cancelled
            if (!loginResult) {
                connectingRef.current = false;
                setIsConnecting(false);
                return;
            }

            // 4. We have the OAuth code. We also need wabaId + phoneNumberId
            //    from the WA_EMBEDDED_SIGNUP events captured in the message
            //    listener above.
            //
            //    Wait briefly for the FINISH event in case it arrives slightly
            //    after the login callback resolves.
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

            const { wabaId, phoneNumberId } = signupSessionRef.current;
            if (!wabaId || !phoneNumberId) {
                throw new Error(
                    "Meta didn't return the phone number details. Please make sure you selected a phone number in the dialog."
                );
            }

            // 5. Call the backend complete-auto endpoint
            const account = await completeWabaConnect({
                code: loginResult.code,
                state: loginResult.state || connectData.state,
                projectId,
                wabaId,
                phoneNumberId,
                redirectUri: connectData.redirectUri,
                fallbackRedirectUri: connectData.fallbackRedirectUri,
            });

            toast.success(
                account.name
                    ? `${account.name} connected successfully`
                    : "WhatsApp connected successfully"
            );

            onSuccess?.();
        } catch (err) {
            console.error("WABA connect failed:", err);
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