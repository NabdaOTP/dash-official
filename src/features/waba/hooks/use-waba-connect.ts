import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
    completeWabaConnect,
    getWabaConnectUrl,
    getWabaStatus,
} from "@/features/waba/services/waba-service";
import { openOAuthPopup } from "@/features/waba/lib/oauth-popup";

interface UseWabaConnectOptions {
    projectId: string;
    onSuccess?: () => void;
}

export function useWabaConnect({ projectId, onSuccess }: UseWabaConnectOptions) {
    const [isConnecting, setIsConnecting] = useState(false);
    const connectingRef = useRef(false);
    const signupSessionRef = useRef<{
        wabaId?: string;
        phoneNumberId?: string;
    }>({});

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
            const eventName =
                typeof obj.event === "string" ? obj.event : undefined;
            if (
                eventName !== "FINISH" &&
                eventName !== "FINISH_ONLY_WABA" &&
                eventName !== "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING"
            ) {
                return;
            }

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
            const connectData = await getWabaConnectUrl(projectId);
            if (!connectData.connectUrl) {
                throw new Error("No Meta connect URL was returned by backend.");
            }

            let baselineCount = 0;
            try {
                const before = await getWabaStatus(projectId);
                baselineCount = before.accounts.length;
            } catch {
                // Ignore status read failures and rely on popup signals.
            }

            const hasNewAccount = async (): Promise<boolean> => {
                try {
                    const status = await getWabaStatus(projectId);
                    return status.accounts.length > baselineCount;
                } catch {
                    return false;
                }
            };

            const result = await openOAuthPopup(
                connectData.connectUrl,
                "Connect WhatsApp",
                {
                    onPoll: hasNewAccount,
                    pollIntervalMs: 2000,
                    pollTimeoutMs: 30000,
                }
            );

            if (result.completed) {
                const callbackPayload =
                    result.payload && typeof result.payload === "object"
                        ? (result.payload as Record<string, unknown>)
                        : null;
                const requiresCompletion =
                    callbackPayload?.requiresCompletion === true;

                const asText = (value: unknown): string | undefined =>
                    typeof value === "string" && value.trim()
                        ? value.trim()
                        : undefined;

                if (requiresCompletion) {
                    const callbackCode = asText(callbackPayload?.code);
                    const callbackState =
                        asText(callbackPayload?.state) || connectData.state;
                    const callbackWabaId =
                        asText(callbackPayload?.wabaId) ||
                        asText(callbackPayload?.waba_id);
                    const callbackPhoneNumberId =
                        asText(callbackPayload?.phoneNumberId) ||
                        asText(callbackPayload?.phone_number_id);
                    const wabaId =
                        callbackWabaId || signupSessionRef.current.wabaId;
                    const phoneNumberId =
                        callbackPhoneNumberId ||
                        signupSessionRef.current.phoneNumberId;

                    if (callbackCode && callbackState && wabaId && phoneNumberId) {
                        await completeWabaConnect({
                            code: callbackCode,
                            state: callbackState,
                            projectId,
                            wabaId,
                            phoneNumberId,
                            redirectUri: connectData.redirectUri,
                            fallbackRedirectUri: connectData.fallbackRedirectUri,
                        });
                        toast.success("WhatsApp connected successfully");
                        onSuccess?.();
                        return;
                    }
                }

                let confirmed = await hasNewAccount();
                if (!confirmed) {
                    for (let i = 0; i < 10; i++) {
                        await new Promise((r) => window.setTimeout(r, 1500));
                        confirmed = await hasNewAccount();
                        if (confirmed) break;
                    }
                }

                if (confirmed) {
                    toast.success("WhatsApp connected successfully");
                    onSuccess?.();
                    return;
                }

                toast.info(
                    "Authorization finished, but we're still waiting for Meta sync. Please refresh in a moment.",
                    { duration: 8000 }
                );
                return;
            }

            if (result.error) {
                throw new Error(result.error);
            }
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
